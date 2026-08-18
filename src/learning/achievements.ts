import { allLessons, curriculum, levelIndex } from '@/content';
import { estimateLevel, wordsLearned, wordsMastered } from '@/learning/mastery';
import { mastery } from '@/learning/srs';
import type { LearnerState } from '@/learning/types';
import { levelInfo } from '@/learning/xp';

/**
 * Achievements are derived, never stored — so they stay correct if the model
 * changes and can never drift out of sync with reality.
 *
 * They are tiered deliberately: the first rung of each family is reachable in a
 * week, the last is a genuine long-haul goal. A wall of trophies you can clear
 * in two sessions is worth nothing, which is why CEFR milestones, deep mastery
 * and long streaks carry the top tiers.
 */

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type AchievementGroup =
  | 'consistency'
  | 'vocabulary'
  | 'course'
  | 'skill'
  | 'effort';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  group: AchievementGroup;
  tier: AchievementTier;
  progress: number;
  target: number;
  unlocked: boolean;
}

export const GROUP_LABELS: Record<AchievementGroup, string> = {
  consistency: 'Consistency',
  course: 'Course progress',
  vocabulary: 'Vocabulary',
  skill: 'Skills',
  effort: 'Effort',
};

const TIER_ORDER: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum'];

/** Builds a tiered family from one metric, e.g. streak 7 / 30 / 100 / 365. */
function tiers(
  base: { id: string; icon: string; group: AchievementGroup; describe: (t: number) => string },
  title: (target: number) => string,
  value: number,
  targets: [number, number, number, number],
): Omit<Achievement, 'unlocked'>[] {
  return targets.map((target, index) => ({
    id: `${base.id}-${target}`,
    icon: base.icon,
    title: title(target),
    description: base.describe(target),
    group: base.group,
    tier: TIER_ORDER[index],
    progress: Math.min(value, target),
    target,
  }));
}

export function achievements(learner: LearnerState, now = Date.now()): Achievement[] {
  const bestStreak = Math.max(learner.streak, learner.longestStreak);
  const words = wordsLearned(learner);
  const mastered = wordsMastered(learner, now);
  const levels = levelInfo(learner.xp);
  const hours = learner.totalSeconds / 3600;

  const listening = Object.values(learner.concepts).filter((state) =>
    state.kinds.some((k) => k === 'listenSelect' || k === 'dictation' || k === 'listenComprehend'),
  ).length;
  const produced = Object.values(learner.concepts).filter((state) =>
    state.kinds.some((k) => k === 'translateToEs' || k === 'conversation' || k === 'buildResponse'),
  ).length;

  const hardModeSessions = learner.sessions.filter((s) => s.source === 'hardMode').length;
  const conversations = learner.sessions.filter((s) => s.source.includes('conv')).length;
  const stories = learner.sessions.filter((s) => s.source.includes('story')).length;
  const perfectSessions = learner.sessions.filter(
    (s) => s.total >= 8 && s.correct === s.total,
  ).length;

  const lessonsDone = allLessons.filter((lesson) => learner.completedLessons[lesson.id]).length;
  const checkpointsDone = allLessons.filter(
    (lesson) => lesson.kind === 'checkpoint' && learner.completedLessons[lesson.id],
  ).length;
  const checkpointTotal = allLessons.filter((lesson) => lesson.kind === 'checkpoint').length;

  const currentLevel = levelIndex(estimateLevel(learner, now));

  // Concepts held above 90% — genuinely deep knowledge, not just "seen".
  const deep = Object.values(learner.concepts).filter(
    (state) => mastery(state, now) >= 0.9,
  ).length;

  const stagesComplete = curriculum.filter((stage) => {
    const playable = stage.units.filter((unit) => unit.lessons.length > 0);
    if (playable.length === 0) return false;
    return playable.every((unit) =>
      unit.lessons.every((lesson) => learner.completedLessons[lesson.id]),
    );
  }).length;

  const definitions: Omit<Achievement, 'unlocked'>[] = [
    // --- Consistency: the long game ---------------------------------------
    ...tiers(
      {
        id: 'streak',
        icon: 'flame',
        group: 'consistency',
        describe: (t) => `Study on ${t} consecutive days`,
      },
      (t) => `${t} day streak`,
      bestStreak,
      [7, 30, 100, 365],
    ),

    // --- Course: the real milestones --------------------------------------
    {
      id: 'level-a1',
      icon: 'flag',
      title: 'Reached A1',
      description: 'Your estimated level hits A1',
      group: 'course',
      tier: 'bronze',
      progress: Math.min(currentLevel, 1),
      target: 1,
    },
    {
      id: 'level-a2',
      icon: 'flag',
      title: 'Reached A2',
      description: 'Your estimated level hits A2',
      group: 'course',
      tier: 'silver',
      progress: Math.min(currentLevel, 2),
      target: 2,
    },
    {
      id: 'level-b1',
      icon: 'flag',
      title: 'Reached B1',
      description: 'Independent user — the level most people never reach',
      group: 'course',
      tier: 'gold',
      progress: Math.min(currentLevel, 3),
      target: 3,
    },
    {
      id: 'level-b2',
      icon: 'trophy',
      title: 'Reached B2',
      description: 'Upper intermediate. You can hold your own in Spain',
      group: 'course',
      tier: 'platinum',
      progress: Math.min(currentLevel, 4),
      target: 4,
    },
    {
      id: 'level-c1',
      icon: 'trophy',
      title: 'Reached C1',
      description: 'Advanced. The goal you actually set out for',
      group: 'course',
      tier: 'platinum',
      progress: Math.min(currentLevel, 5),
      target: 5,
    },
    {
      id: 'stage-1',
      icon: 'ribbon',
      title: 'First stage complete',
      description: 'Finish every unit in a CEFR stage',
      group: 'course',
      tier: 'silver',
      progress: Math.min(stagesComplete, 1),
      target: 1,
    },
    {
      id: 'stage-all',
      icon: 'ribbon',
      title: 'Every written stage',
      description: 'Finish every stage that has lessons today',
      group: 'course',
      tier: 'platinum',
      progress: stagesComplete,
      target: 4,
    },
    {
      id: 'checkpoints',
      icon: 'shield-checkmark',
      title: 'Checkpoint clear',
      description: 'Pass every CEFR checkpoint in the course',
      group: 'course',
      tier: 'gold',
      progress: checkpointsDone,
      target: Math.max(checkpointTotal, 1),
    },
    ...tiers(
      {
        id: 'lessons',
        icon: 'school',
        group: 'course',
        describe: (t) => `Complete ${t} lessons`,
      },
      (t) => `${t} lessons`,
      lessonsDone,
      [10, 25, 47, 100],
    ),

    // --- Vocabulary: met vs actually known --------------------------------
    ...tiers(
      {
        id: 'words',
        icon: 'book',
        group: 'vocabulary',
        describe: (t) => `Meet ${t} different words`,
      },
      (t) => `${t} words met`,
      words,
      [50, 150, 400, 1000],
    ),
    ...tiers(
      {
        id: 'mastered',
        icon: 'diamond',
        group: 'vocabulary',
        describe: (t) => `Hold ${t} words above 80% mastery`,
      },
      (t) => `${t} words mastered`,
      mastered,
      [25, 100, 300, 750],
    ),
    {
      id: 'deep-100',
      icon: 'sparkles',
      title: 'Deep knowledge',
      description: 'Hold 100 concepts above 90% — knowing, not recognising',
      group: 'vocabulary',
      tier: 'gold',
      progress: deep,
      target: 100,
    },

    // --- Skills ------------------------------------------------------------
    ...tiers(
      {
        id: 'listening',
        icon: 'headset',
        group: 'skill',
        describe: (t) => `Practise ${t} concepts by ear`,
      },
      (t) => `${t} heard`,
      listening,
      [25, 100, 300, 600],
    ),
    ...tiers(
      {
        id: 'production',
        icon: 'create',
        group: 'skill',
        describe: (t) => `Produce ${t} concepts from scratch`,
      },
      (t) => `${t} produced`,
      produced,
      [25, 100, 300, 600],
    ),
    {
      id: 'conversation-1',
      icon: 'chatbubbles',
      title: 'First conversation',
      description: 'Complete a conversation scene',
      group: 'skill',
      tier: 'bronze',
      progress: Math.min(conversations, 1),
      target: 1,
    },
    {
      id: 'conversation-all',
      icon: 'chatbubbles',
      title: 'Talked your way through',
      description: 'Complete every conversation scene in the course',
      group: 'skill',
      tier: 'gold',
      progress: conversations,
      target: 4,
    },
    {
      id: 'stories',
      icon: 'book-outline',
      title: 'Storyteller',
      description: 'Finish every story in the course',
      group: 'skill',
      tier: 'silver',
      progress: stories,
      target: 2,
    },

    // --- Effort -------------------------------------------------------------
    ...tiers(
      {
        id: 'xp',
        icon: 'flash',
        group: 'effort',
        describe: (t) => `Earn ${t.toLocaleString()} experience points`,
      },
      (t) => `${t.toLocaleString()} XP`,
      learner.xp,
      [500, 2500, 10000, 50000],
    ),
    ...tiers(
      {
        id: 'hours',
        icon: 'hourglass',
        group: 'effort',
        describe: (t) => `Study for ${t} hours in total`,
      },
      (t) => `${t} hours`,
      Math.floor(hours),
      [5, 25, 100, 500],
    ),
    ...tiers(
      {
        id: 'hard',
        icon: 'barbell',
        group: 'effort',
        describe: (t) => `Complete ${t} hard-mode sessions`,
      },
      (t) => `${t} hard sessions`,
      hardModeSessions,
      [5, 25, 75, 200],
    ),
    {
      id: 'perfect-10',
      icon: 'checkmark-done',
      title: 'Ten flawless',
      description: 'Finish ten sessions of 8+ questions without a single mistake',
      group: 'effort',
      tier: 'gold',
      progress: perfectSessions,
      target: 10,
    },
    {
      id: 'learner-level-25',
      icon: 'trending-up',
      title: 'Level 25',
      description: 'Reach learner level 25',
      group: 'effort',
      tier: 'gold',
      progress: levels.level,
      target: 25,
    },
    {
      id: 'learner-level-50',
      icon: 'trending-up',
      title: 'Level 50',
      description: 'Reach learner level 50',
      group: 'effort',
      tier: 'platinum',
      progress: levels.level,
      target: 50,
    },
  ];

  return definitions.map((definition) => ({
    ...definition,
    progress: Math.min(definition.progress, definition.target),
    unlocked: definition.progress >= definition.target,
  }));
}

export function achievementsByGroup(
  learner: LearnerState,
  now = Date.now(),
): { group: AchievementGroup; label: string; items: Achievement[] }[] {
  const all = achievements(learner, now);
  return (Object.keys(GROUP_LABELS) as AchievementGroup[]).map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: all.filter((item) => item.group === group),
  }));
}

/**
 * Which achievements a session unlocked.
 *
 * Achievements are derived, so "new" cannot be a stored flag — it is a
 * comparison between two states. Taking that diff at the moment a session ends
 * is the only way to celebrate one at the moment it happens rather than leaving
 * the learner to notice it on the profile page three days later.
 */
export function newlyUnlocked(
  before: LearnerState,
  after: LearnerState,
  now = Date.now(),
): Achievement[] {
  const had = new Set(
    achievements(before, now)
      .filter((achievement) => achievement.unlocked)
      .map((achievement) => achievement.id),
  );
  return achievements(after, now).filter(
    (achievement) => achievement.unlocked && !had.has(achievement.id),
  );
}
