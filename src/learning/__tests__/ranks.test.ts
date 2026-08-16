import {
  RANKS,
  isMilestoneLevel,
  nextRank,
  rankForLevel,
  rankProgress,
  xpToReachRank,
} from '@/learning/ranks';
import { cumulativeXp } from '@/learning/xp';

describe('rank ladder', () => {
  it('covers every level with no gaps or overlaps', () => {
    for (let i = 0; i < RANKS.length - 1; i += 1) {
      expect(RANKS[i].to).toBe(RANKS[i + 1].from - 1);
    }
    expect(RANKS[0].from).toBe(1);
    expect(RANKS[RANKS.length - 1].to).toBeNull();
  });

  it('places each level in exactly one rank', () => {
    for (let level = 1; level <= 80; level += 1) {
      const matching = RANKS.filter(
        (rank) => level >= rank.from && (rank.to === null || level <= rank.to),
      );
      expect(matching).toHaveLength(1);
      expect(rankForLevel(level)).toBe(matching[0]);
    }
  });

  it('keeps the final rank open-ended', () => {
    expect(rankForLevel(999).id).toBe('leyenda');
    expect(nextRank(999)).toBeUndefined();
  });

  it('treats the first level of each rank as a milestone', () => {
    for (const rank of RANKS) expect(isMilestoneLevel(rank.from)).toBe(true);
    // A level in the middle of a band is not.
    expect(isMilestoneLevel(12)).toBe(false);
    expect(isMilestoneLevel(25)).toBe(false);
  });
});

describe('rankProgress', () => {
  it('starts a new learner at level 1, Principiante', () => {
    const p = rankProgress(0);
    expect(p.level).toBe(1);
    expect(p.rank.id).toBe('principiante');
    expect(p.into).toBe(0);
    expect(p.progress).toBe(0);
  });

  it('reports the XP remaining to the next level', () => {
    const p = rankProgress(0);
    expect(p.toNextLevel).toBe(p.needed);
    expect(rankProgress(cumulativeXp(2) - 1).toNextLevel).toBe(1);
  });

  it('lands exactly on a rank boundary with zero XP owing', () => {
    for (const rank of RANKS.slice(1)) {
      const p = rankProgress(xpToReachRank(rank));
      expect(p.level).toBe(rank.from);
      expect(p.rank.id).toBe(rank.id);
    }
  });

  it('counts down XP to the next rank, reaching zero at the boundary', () => {
    const hablante = RANKS.find((r) => r.id === 'hablante')!;
    const justBefore = rankProgress(xpToReachRank(hablante) - 50);
    expect(justBefore.rank.id).toBe('aprendiz');
    expect(justBefore.toNextRank).toBe(50);

    const atBoundary = rankProgress(xpToReachRank(hablante));
    expect(atBoundary.rank.id).toBe('hablante');
    expect(atBoundary.rankProgress).toBe(0);
  });

  it('advances rank progress monotonically within a band', () => {
    const start = xpToReachRank(RANKS[2]);
    // Stop one XP short: landing on the boundary means you are in the *next*
    // band, where progress correctly restarts at zero.
    const end = xpToReachRank(RANKS[3]) - 1;
    const step = Math.floor((end - start) / 20);

    let previous = -1;
    for (let xp = start; xp <= end; xp += step) {
      const value = rankProgress(xp).rankProgress ?? 1;
      expect(rankProgress(xp).rank.id).toBe(RANKS[2].id);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
    expect(previous).toBeGreaterThan(0.9);
  });

  it('omits rank targets at the final rank', () => {
    const p = rankProgress(cumulativeXp(60));
    expect(p.rank.id).toBe('leyenda');
    expect(p.next).toBeUndefined();
    expect(p.toNextRank).toBeUndefined();
    expect(p.rankProgress).toBeUndefined();
  });

  it('never reports negative XP owing', () => {
    for (const xp of [0, 1, 500, 2340, 8740, 51940, 999999]) {
      const p = rankProgress(xp);
      expect(p.toNextLevel).toBeGreaterThanOrEqual(0);
      expect(p.toNextRank ?? 0).toBeGreaterThanOrEqual(0);
    }
  });
});
