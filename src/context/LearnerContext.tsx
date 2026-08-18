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
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { getLesson, validateContent } from '@/content';
import { ColorSchemeContext } from '@/hooks/use-theme';
import type { Exercise } from '@/learning/exercise';
import { applyPlacement, type PlacementAnswer, type PlacementScore } from '@/learning/placement';
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
import { xpForAnswer } from '@/learning/xp';
import { nextStreak, toISODate } from '@/lib/date';
import { configureFeedback } from '@/lib/feedback';
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

export const STATE_VERSION = 1;
const MAX_MISTAKES = 200;
const MAX_SESSIONS = 200;
const MAX_DAILY = 400;

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  appearance: 'system',
  haptics: true,
  autoPlayAudio: true,
  strictAccents: false,
  hardMode: false,
  speakingExercises: true,
  slowAudioDefault: false,
  showTranslations: true,
  dailyGoal: 10,
};

function createLearnerState(now = Date.now()): LearnerState {
  return {
    version: STATE_VERSION,
    settings: DEFAULT_SETTINGS,
    concepts: {},
    completedLessons: {},
    mistakes: [],
    sessions: [],
    daily: [],
    xp: 0,
    streak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    placement: null,
    onboarded: false,
    favourites: [],
    totalSeconds: 0,
    createdAt: now,
  };
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
  const [learner, setLearner] = useState<LearnerState>(() => createLearnerState());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(learner);
  latest.current = learner;

  // --- Hydration ----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await storage.get<LearnerState>(StorageKeys.learner);
      if (!cancelled && saved && saved.version === STATE_VERSION) {
        setLearner({
          ...createLearnerState(saved.createdAt),
          ...saved,
          settings: { ...DEFAULT_SETTINGS, ...saved.settings },
        });
      }
      if (!cancelled) setReady(true);
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
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      storage.set(StorageKeys.learner, latest.current);
      // A rolling copy under its own key, at most twice a day. It costs one
      // extra write on the sessions that happen to cross the interval, and it
      // is the only thing standing between a bad write and a year of progress.
      void maybeSnapshot(latest.current);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [learner, ready]);

  useEffect(() => {
    configureFeedback({ haptics: learner.settings.haptics });
  }, [learner.settings.haptics]);

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
        };
        mistakes = [...prev.mistakes, record].slice(-MAX_MISTAKES);
      } else if (grade === 'correct') {
        // Answering correctly resolves any open mistake on the same concepts.
        mistakes = prev.mistakes.map((mistake) =>
          !mistake.resolvedAt && mistake.conceptIds.some((id) => touched.includes(id))
            ? { ...mistake, resolvedAt: now }
            : mistake,
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
    setLearner((prev) => ({
      ...createLearnerState(incoming.createdAt),
      ...incoming,
      settings: { ...DEFAULT_SETTINGS, ...prev.settings },
    }));
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
