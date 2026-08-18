import { BACKUP_FORMAT } from '@/learning/backup';
import { conceptStates, curriculumLevel, estimateProficiency, skillBalance, skillSummaries } from '@/learning/mastery';
import { isDue } from '@/learning/srs';
import type { LearnerState } from '@/learning/types';

/**
 * The block of text that turns "it did something odd" into a bug report.
 *
 * Deliberately pure and deliberately free of anything personal: no name, no
 * avatar, no answers. It is counts, versions and the state of the adaptive
 * layer — which is everything needed to reproduce a scheduling complaint and
 * nothing that would be uncomfortable to paste somewhere.
 */

export interface Environment {
  appVersion: string;
  buildVersion: string;
  platform: string;
  osVersion: string;
  stateVersion: number;
  /** Present when the app is running from an over-the-air update. */
  updateId?: string;
}

export function buildDiagnostics(
  learner: LearnerState,
  env: Environment,
  now = Date.now(),
): string {
  const states = conceptStates(learner);
  const proficiency = estimateProficiency(learner, now);
  const balance = skillBalance(learner, now);

  const lines: string[] = [
    'Unolingo diagnostics',
    `Generated    ${new Date(now).toISOString()}`,
    '',
    '— Build —',
    `App          ${env.appVersion} (${env.buildVersion})`,
    `Platform     ${env.platform} ${env.osVersion}`,
    `State schema ${env.stateVersion}   backup format ${BACKUP_FORMAT}`,
    env.updateId ? `Update       ${env.updateId}` : 'Update       embedded build',
    '',
    '— Progress —',
    `XP           ${learner.xp}`,
    `Streak       ${learner.streak} (longest ${learner.longestStreak})`,
    `Studied      ${Math.round(learner.totalSeconds / 60)} min over ${learner.daily.length} days`,
    `Concepts     ${states.length} total, ${states.filter((s) => s.timesSeen > 0).length} practised, ${states.filter((s) => isDue(s, now)).length} due`,
    `Lessons      ${Object.keys(learner.completedLessons).length} completed`,
    `Sessions     ${learner.sessions.length} recorded`,
    `Mistakes     ${learner.mistakes.filter((m) => !m.resolvedAt).length} open of ${learner.mistakes.length}`,
    `Created      ${new Date(learner.createdAt).toISOString().slice(0, 10)}`,
    `Last study   ${learner.lastStudyDate ?? 'never'}`,
    '',
    '— Level —',
    `Curriculum   ${curriculumLevel(learner, now) ?? 'none complete'}`,
    `Demonstrated ${proficiency.level}${proficiency.plus ? '+' : ''}${
      proficiency.heldBackBy.length > 0 ? ` — held back by ${proficiency.heldBackBy.join(', ')}` : ''
    }`,
    `Measured     ${proficiency.measured ? 'yes' : 'not enough evidence yet'}`,
    `Placement    ${learner.placement ? learner.placement.label : 'skipped'}`,
    '',
    '— Skills —',
    ...skillSummaries(learner, now).map(
      (s) => `${s.label.padEnd(12)} ${Math.round(s.mastery * 100)}% over ${s.seen} concepts`,
    ),
    `Lagging      ${balance.lagging.join(', ') || 'none'}`,
    `Leading      ${balance.leading.join(', ') || 'none'}`,
    '',
    '— Settings —',
    `Hard mode ${learner.settings.hardMode} · strict accents ${learner.settings.strictAccents} · speaking ${learner.settings.speakingExercises} · daily goal ${learner.settings.dailyGoal}`,
  ];

  return lines.join('\n');
}
