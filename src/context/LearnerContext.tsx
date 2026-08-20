import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, useColorScheme as useSystemColorScheme } from 'react-native';

import { getLesson, validateContent } from '@/content';
import { ColorSchemeContext } from '@/hooks/use-theme';
import { DEFAULT_SETTINGS, blankLearnerState } from '@/learning/defaults';
import { migrateState } from '@/learning/migrate';
import { STATE_VERSION } from '@/learning/schema';
import type { Exercise } from '@/learning/exercise';
import { applyPlacement, type PlacementAnswer, type PlacementScore } from '@/learning/placement';
import { applyAnswerToMistakes } from '@/learning/mistakes';
import { createConceptState, introduce, mastery, review } from '@/learning/srs';
import {
  PRESENTATION_KINDS,
  type ConceptState,
  type Grade,
  type LearnerState,
  type MistakeRecord,
  type SessionRecord,
  type Settings,
} from '@/learning/types';
import { reminderBody, reminderSchedule } from '@/learning/reminders';
import { xpForAnswer } from '@/learning/xp';
import { nextStreak, toISODate } from '@/lib/date';
import { configureFeedback } from '@/lib/feedback';
import { scheduleReminders } from '@/lib/notifications';
import { configureSound } from '@/lib/sound';
import { primeSpanishVoice, setPreferredVoice } from '@/lib/speech';
import { maybeSnapshot, snapshotNow } from '@/lib/snapshots';
import { StorageKeys, storage } from '@/lib/storage';

/**
 * The learner store.
 *
 * All persisted state lives here and is written through a debounced save, so a
 * fast answer streak does not hammer AsyncStorage. Screens never touch storage
 * directly — they call `useLearner()`.
 */

export { STATE_VERSION };
const MAX_MISTAKES = 200;
const MAX_SESSIONS = 200;
const MAX_DAILY = 400;

export { DEFAULT_SETTINGS };

/** A new learner, stamped with the schema this build writes. */
function createLearnerState(now = Date.now()): LearnerState {
  return { ...blankLearnerState(now), version: STATE_VERSION };
}

/**
 * What the app knows when it could not open the saved record.
 *
 * The presence of this object is what keeps the debounced save switched off, so
 * the record on disk stays exactly as it was found. That is the entire safety
 * property: the old hydration skipped a record it did not recognise and then
 * let a blank learner overwrite it four hundred milliseconds later.
 */
export interface RecoveryState {
  reason: string;
  /** The bytes we declined to read, verbatim, so they can still be exported. */
  raw: string;
}

export interface AnswerOutcome {
  xp: number;
  grade: Grade;
  /** Concepts whose mastery moved, for the results screen. */
  conceptIds: string[];
}

export interface RecordAnswerInput {
  exercise: Exercise;
  grade: Grade;
  /** What the learner actually gave, for the mistake notebook. */
  given?: string;
  expected?: string;
}

export interface CompleteSessionInput {
  source: string;
  label: string;
  xp: number;
  correct: number;
  total: number;
  seconds: number;
  newConcepts: number;
  /** Set for lesson sessions so the path can advance. */
  lessonId?: string;
}

interface LearnerContextValue {
  ready: boolean;
  /** Set when a saved record exists but could not be opened. Saving stays off. */
  recovery: RecoveryState | null;
  /** Abandons an unreadable record and starts fresh — the only way past one. */
  discardUnreadable: () => Promise<void>;
  learner: LearnerState;
  settings: Settings;
  recordAnswer: (input: RecordAnswerInput) => AnswerOutcome;
  markIntroduced: (conceptIds: string[]) => void;
  completeSession: (input: CompleteSessionInput) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  toggleFavourite: (conceptId: string) => void;
  resolveMistake: (mistakeId: string) => void;
  clearResolvedMistakes: () => void;
  finishPlacement: (score: PlacementScore, answers: PlacementAnswer[]) => void;
  skipPlacement: () => void;
  /** Replaces all progress with a backup or snapshot, keeping local settings. */
  restoreState: (incoming: LearnerState) => Promise<void>;
  resetProgress: () => void;
}

const LearnerContext = createContext<LearnerContextValue | null>(null);

export function LearnerProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState<RecoveryState | null>(null);
  const [learner, setLearner] = useState<LearnerState>(() => createLearnerState());
  /**
   * The newest state, for the two callbacks that need it without wanting to be
   * recreated whenever it changes. Assigned in an effect rather than during
   * render: a ref written while rendering can be read by a render that never
   * commits, and the React Compiler is right to refuse it.
   */
  const latest = useRef(learner);
  useEffect(() => {
    latest.current = learner;
  }, [learner]);

  // --- Hydration ----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      /**
       * Read the bytes, not the object. `storage.get` swallows a parse failure
       * and answers null, which is indistinguishable from a fresh install — and
       * a fresh install is precisely the state that would then be saved over
       * the record that failed to parse.
       */
      const raw = await storage.getRaw(StorageKeys.learner);

      if (raw === null) {
        // No record at all: a genuine first run. Saving may begin.
        if (!cancelled) setReady(true);
      } else {
        let parsed: unknown;
        let broken: string | null = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          broken = 'The saved progress could not be read — the file looks truncated.';
        }

        const result = broken
          ? ({ ok: false, reason: broken, from: null } as const)
          : migrateState(parsed, STATE_VERSION);

        if (!cancelled) {
          if (result.ok) {
            setLearner(result.state);
            if (result.migrated && __DEV__) {
              console.log(
                `[learner] upgraded saved progress from version ${result.from} to ${STATE_VERSION}`,
              );
            }
            setReady(true);
          } else {
            // Never `setReady(true)` here: that is what switches the debounced
            // save on, and the one thing that must not happen to a record we
            // could not read is being written over.
            await storage.set(StorageKeys.quarantine, { at: Date.now(), reason: result.reason, raw });
            setRecovery({ reason: result.reason, raw });
          }
        }
      }
      primeSpanishVoice();

      if (__DEV__) {
        const problems = validateContent();
        if (problems.length > 0) {
          console.warn(`[content] ${problems.length} integrity problem(s):\n` + problems.join('\n'));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Debounced persistence ----------------------------------------------
  // The cleanup cancels the pending write on every change, which *is* the
  // debounce — no ref needed, and the closure always has the state it is saving.
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      storage.set(StorageKeys.learner, learner);
      // A rolling copy under its own key, at most twice a day. It costs one
      // extra write on the sessions that happen to cross the interval, and it
      // is the only thing standing between a bad write and a year of progress.
      void maybeSnapshot(learner);
    }, 400);
    return () => clearTimeout(timer);
  }, [learner, ready]);

  /**
   * Write immediately when the app leaves the foreground.
   *
   * Four hundred milliseconds is nothing at a desk and is a real gap on a phone:
   * answer the last question of a session, swipe up, and the pending write is
   * still pending. Worse, a backgrounded app can have its JS thread suspended
   * before the timer fires at all, so the write is not merely late — it never
   * happens, and the next launch is a session behind.
   *
   * `latest` rather than `learner` so the listener is registered once instead of
   * being torn down and rebuilt on every answer.
   */
  useEffect(() => {
    if (!ready) return;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') {
        void storage.set(StorageKeys.learner, latest.current);
      }
    });
    return () => subscription.remove();
  }, [ready]);

  useEffect(() => {
    configureFeedback({ haptics: learner.settings.haptics });
  }, [learner.settings.haptics]);

  useEffect(() => {
    configureSound({ sounds: learner.settings.sounds });
  }, [learner.settings.sounds]);

  /**
   * Re-arm the reminder queue whenever the app has new information: after
   * hydration, when the setting changes, and — the one that makes "if I
   * haven't studied yet" work at all — the moment `lastStudyDate` moves.
   * `reminderSchedule` decides whether today's six o'clock slot is still worth
   * taking; this only carries the answer to the OS.
   */
  useEffect(() => {
    if (!ready) return;
    const when = reminderSchedule({
      now: new Date(),
      lastStudyDate: learner.lastStudyDate,
      enabled: learner.settings.reminders,
      hour: learner.settings.reminderHour,
    });
    void scheduleReminders(when, {
      title: 'Unolingo',
      body: reminderBody(learner.streak),
    });
  }, [
    ready,
    learner.settings.reminders,
    learner.settings.reminderHour,
    learner.lastStudyDate,
    learner.streak,
  ]);

  useEffect(() => {
    setPreferredVoice(learner.settings.voiceId);
  }, [learner.settings.voiceId]);

  // --- Actions ------------------------------------------------------------

  const recordAnswer = useCallback((input: RecordAnswerInput): AnswerOutcome => {
    const { exercise, grade, given, expected } = input;
    const now = Date.now();

    let earned = 0;
    const touched = exercise.conceptIds;

    setLearner((prev) => {
      const concepts = { ...prev.concepts };
      let masteryBefore = 0;

      for (const conceptId of touched) {
        const existing = concepts[conceptId] ?? createConceptState(conceptId, now);
        if (conceptId === touched[0]) masteryBefore = mastery(existing, now);
        concepts[conceptId] = review(existing, {
          grade,
          difficulty: exercise.difficulty,
          kind: exercise.kind,
          now,
        });
      }

      earned = xpForAnswer({
        kind: exercise.kind,
        grade,
        hardMode: prev.settings.hardMode,
        mastery: masteryBefore,
      });

      // Mistakes are only worth recording when there is something to look at.
      let mistakes = prev.mistakes;
      if (grade === 'incorrect' && given !== undefined && expected !== undefined) {
        const record: MistakeRecord = {
          id: `${exercise.id}:${now}`,
          at: now,
          conceptIds: touched,
          kind: exercise.kind,
          prompt: exercise.instruction,
          given,
          expected,
          explanation: exercise.note,
          /**
           * Enough to rebuild the exercise, not merely to describe it. Without
           * these two, "review my mistakes" can only ask the generator for
           * something about the same concepts — which is how a failed
           * translation came back as an unrelated multiple choice.
           */
          sentenceId: exercise.sourceId,
          targetId: exercise.targetId ?? touched[0],
        };
        mistakes = [...prev.mistakes, record].slice(-MAX_MISTAKES);
      } else {
        /**
         * Resolution is now evidence-based, and much narrower than it was.
         *
         * The old rule closed *any* open mistake sharing *any* concept with any
         * correct answer. Since `conceptIds` is the whole exercise's scoring
         * list, a mistake made on a four-concept sentence was cleared by
         * getting a multiple choice right about one of the other three — so the
         * queue emptied itself without a single mistake being confronted, which
         * is half of why "Review mistakes" had so little in it that made sense.
         *
         * `resolves` requires a *correct* answer (an `almost` lengthens the
         * interval and would hide the mistake for longer than getting it right)
         * aimed at the mistake's own target concept.
         */
        mistakes = applyAnswerToMistakes(
          prev.mistakes,
          { conceptIds: touched, targetId: exercise.targetId, grade },
          now,
        );
      }

      return { ...prev, concepts, mistakes, xp: prev.xp + earned };
    });

    return { xp: earned, grade, conceptIds: touched };
  }, []);

  /** Teaching cards mark a concept as met without scoring it. */
  const markIntroduced = useCallback((conceptIds: string[]) => {
    if (conceptIds.length === 0) return;
    const now = Date.now();
    setLearner((prev) => {
      const concepts = { ...prev.concepts };
      for (const conceptId of conceptIds) {
        const existing = concepts[conceptId] ?? createConceptState(conceptId, now);
        concepts[conceptId] = introduce(existing, now);
      }
      return { ...prev, concepts };
    });
  }, []);

  const completeSession = useCallback((input: CompleteSessionInput) => {
    const now = Date.now();
    const today = toISODate(now);

    setLearner((prev) => {
      const record: SessionRecord = {
        id: `${input.source}:${now}`,
        at: now,
        source: input.source,
        label: input.label,
        xp: input.xp,
        correct: input.correct,
        total: input.total,
        duration: input.seconds,
        newConcepts: input.newConcepts,
      };

      const daily = [...prev.daily];
      const todayIndex = daily.findIndex((entry) => entry.date === today);
      if (todayIndex >= 0) {
        daily[todayIndex] = {
          ...daily[todayIndex],
          xp: daily[todayIndex].xp + input.xp,
          seconds: daily[todayIndex].seconds + input.seconds,
          exercises: daily[todayIndex].exercises + input.total,
        };
      } else {
        daily.push({ date: today, xp: input.xp, seconds: input.seconds, exercises: input.total });
      }

      const streak = nextStreak(prev.lastStudyDate, prev.streak, today);

      const completedLessons = { ...prev.completedLessons };
      if (input.lessonId && getLesson(input.lessonId)) {
        const previousEntry = completedLessons[input.lessonId];
        const accuracy = input.total > 0 ? input.correct / input.total : 1;
        completedLessons[input.lessonId] = {
          at: now,
          accuracy: previousEntry ? Math.max(previousEntry.accuracy, accuracy) : accuracy,
          times: (previousEntry?.times ?? 0) + 1,
        };
      }

      return {
        ...prev,
        sessions: [...prev.sessions, record].slice(-MAX_SESSIONS),
        daily: daily.slice(-MAX_DAILY),
        completedLessons,
        streak,
        longestStreak: Math.max(prev.longestStreak, streak),
        lastStudyDate: today,
        totalSeconds: prev.totalSeconds + input.seconds,
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setLearner((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const toggleFavourite = useCallback((conceptId: string) => {
    setLearner((prev) => ({
      ...prev,
      favourites: prev.favourites.includes(conceptId)
        ? prev.favourites.filter((id) => id !== conceptId)
        : [...prev.favourites, conceptId],
    }));
  }, []);

  const resolveMistake = useCallback((mistakeId: string) => {
    const now = Date.now();
    setLearner((prev) => ({
      ...prev,
      mistakes: prev.mistakes.map((mistake) =>
        mistake.id === mistakeId ? { ...mistake, resolvedAt: now } : mistake,
      ),
    }));
  }, []);

  const clearResolvedMistakes = useCallback(() => {
    setLearner((prev) => ({
      ...prev,
      mistakes: prev.mistakes.filter((mistake) => !mistake.resolvedAt),
    }));
  }, []);

  const finishPlacement = useCallback((score: PlacementScore, answers: PlacementAnswer[]) => {
    setLearner((prev) => applyPlacement(prev, score, answers));
  }, []);

  const skipPlacement = useCallback(() => {
    setLearner((prev) => ({ ...prev, onboarded: true }));
  }, []);

  /**
   * Replaces everything with a backup or a snapshot.
   *
   * Settings stay local — see `stateFromBackup`. A snapshot is taken first, so
   * restoring the wrong file is itself undoable, which is the difference between
   * a restore button and a loaded gun.
   */
  const restoreState = useCallback(async (incoming: LearnerState) => {
    await snapshotNow(latest.current);
    /**
     * Through the migrator, not around it. A backup written by an older build
     * carries that build's `version`, and spreading it in verbatim stamped the
     * live record with a version this build does not write — so the restore
     * appeared to work and the *next* launch found a record it could not open.
     */
    const result = migrateState(incoming, STATE_VERSION);
    const next = result.ok ? result.state : { ...incoming, version: STATE_VERSION };
    setLearner((prev) => ({
      ...createLearnerState(next.createdAt),
      ...next,
      settings: { ...DEFAULT_SETTINGS, ...prev.settings },
    }));
  }, []);

  /**
   * The deliberate way out of a quarantined record: the learner says, in as many
   * words, that they accept starting again. The bytes stay under the quarantine
   * key regardless, so "start fresh" is still not the same as "delete".
   */
  const discardUnreadable = useCallback(async () => {
    await storage.remove(StorageKeys.learner);
    setLearner(createLearnerState());
    setRecovery(null);
    setReady(true);
  }, []);

  const resetProgress = useCallback(() => {
    // Same reasoning: the most destructive button in the app is the one that
    // most needs a copy taken before it fires.
    void snapshotNow(latest.current);
    setLearner((prev) => ({
      ...createLearnerState(),
      settings: prev.settings,
    }));
  }, []);

  const value = useMemo<LearnerContextValue>(
    () => ({
      ready,
      recovery,
      discardUnreadable,
      learner,
      settings: learner.settings,
      recordAnswer,
      markIntroduced,
      completeSession,
      updateSettings,
      toggleFavourite,
      resolveMistake,
      clearResolvedMistakes,
      finishPlacement,
      skipPlacement,
      restoreState,
      resetProgress,
    }),
    [
      ready,
      recovery,
      discardUnreadable,
      learner,
      recordAnswer,
      markIntroduced,
      completeSession,
      updateSettings,
      toggleFavourite,
      resolveMistake,
      clearResolvedMistakes,
      finishPlacement,
      skipPlacement,
      restoreState,
      resetProgress,
    ],
  );

  return <LearnerContext.Provider value={value}>{children}</LearnerContext.Provider>;
}

export function useLearner(): LearnerContextValue {
  const ctx = useContext(LearnerContext);
  if (!ctx) throw new Error('useLearner must be used within a LearnerProvider');
  return ctx;
}

/** Convenience: the concept state map, for screens that read mastery directly. */
export function useConceptState(conceptId: string): ConceptState | undefined {
  return useLearner().learner.concepts[conceptId];
}

/**
 * Resolves the appearance preference against the OS setting and publishes the
 * result, so `useTheme()` works everywhere without prop drilling.
 */
export function ThemeSchemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useLearner();
  const system = useSystemColorScheme();
  const scheme =
    settings.appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : settings.appearance;

  return <ColorSchemeContext.Provider value={scheme}>{children}</ColorSchemeContext.Provider>;
}

export { PRESENTATION_KINDS };
