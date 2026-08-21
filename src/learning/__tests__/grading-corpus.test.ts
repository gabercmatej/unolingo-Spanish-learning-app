import { conversations, sentences } from '@/content';
import { accentCarriesMeaning } from '@/content/accent-pairs';
import { EN_EQUIVALENCES } from '@/content/equivalences';
import { checkAnswer } from '@/learning/answer-check';
import { COVERAGE_THRESHOLD, meaningCoverage } from '@/learning/meaning';

/**
 * The corpus, not a handful of remembered examples.
 *
 * Every prior test in this branch checks the grader against sentences someone
 * thought to write down. That only ever covers the cases someone remembered —
 * and every commit on this branch made the grader more permissive, which is
 * exactly the kind of change whose failure mode is silent: nothing throws,
 * every existing test stays green, and the app quietly starts accepting
 * answers that are wrong. So these two suites run over the whole corpus
 * instead of a sample of it, and they grow automatically as content is added.
 *
 * Two directions, both load-bearing:
 *   - self-consistency: the grader must accept the content it was calibrated
 *     against. A permissiveness layer that breaks the canonical answer is
 *     worse than no layer at all.
 *   - mutation: the grader must refuse the corpus's own sentences once a
 *     meaning-changing error has been mechanically introduced into them.
 */

const es = { language: 'es' as const, accentCarriesMeaning };
const en = { language: 'en' as const, equivalences: EN_EQUIVALENCES };

describe('the corpus grades itself', () => {
  it('accepts every authored Spanish answer against itself', () => {
    const failures = sentences
      .filter((s) => checkAnswer(s.es, [s.es, ...(s.altEs ?? [])], es).verdict === 'incorrect')
      .map((s) => `${s.id}: ${s.es}`);
    expect(failures).toEqual([]);
  });

  it('accepts every authored English answer against itself', () => {
    const failures = sentences
      .filter((s) => checkAnswer(s.en, [s.en, ...(s.altEn ?? [])], en).verdict === 'incorrect')
      .map((s) => `${s.id}: ${s.en}`);
    expect(failures).toEqual([]);
  });

  it('accepts every authored alternative, not merely the canonical one', () => {
    const failures: string[] = [];
    for (const s of sentences)
      for (const alt of s.altEs ?? [])
        if (checkAnswer(alt, [s.es, ...(s.altEs ?? [])], es).verdict === 'incorrect')
          failures.push(`${s.id}: ${alt}`);
    expect(failures).toEqual([]);
  });

  it('lets every free conversation turn be answered with its own model', () => {
    // The defect that started this: 107 turns nobody could pass. Each turn's
    // own authored answers must clear the coverage threshold against the turn.
    const failures: string[] = [];
    for (const scene of conversations)
      for (const turn of scene.turns) {
        if (turn.speaker !== 'you' || !turn.accepted?.length) continue;
        for (const model of turn.accepted) {
          const best = Math.max(...turn.accepted.map((m) => meaningCoverage(model, m)));
          if (best < COVERAGE_THRESHOLD) failures.push(`${scene.id}: ${model}`);
        }
      }
    expect(failures).toEqual([]);
  });

  /**
   * Calibration, asserted rather than assumed.
   *
   * The brief's own suggested test here computed `meaningCoverage(model,
   * model)` — a model scored against itself, which is 1 by construction for
   * any non-empty string. Asserting that against the threshold proves
   * nothing: it would pass even if the threshold were 0.99, or if
   * `meaningCoverage` were broken in a way that only self-comparison happens
   * to paper over.
   *
   * The obvious replacement — score every model against every *other* model
   * of the same turn, and require the worst of those cross-matches to clear
   * the threshold — turned out to assert something false about this corpus,
   * not something wrong with the grader. Measured directly: **63 of the 107
   * multi-model turns have no pair among their own accepted answers that
   * `meaningCoverage` recognises as equivalent, at any threshold below 1**.
   * Reading the actual pairs shows why this is correct behaviour, not a
   * defect — `conv.debate`'s "puede ser, pero en la ciudad hay más trabajo"
   * and "puede ser, pero yo no lo veo así" are two different debate
   * positions, not two phrasings of one position; `conv.malentendido`'s four
   * "concede the point and add a caveat" answers each name a *different*
   * caveat (trabas / plazos poco realistas / el riesgo de no hacerlo /
   * asumir menos riesgo). A turn's `accepted` list is a set of independently
   * valid answers to an open instruction, not a paraphrase set — nothing
   * requires two of them to share content, and for a genuinely open prompt
   * they usually should not. Asserting a floor over *every* pair would be
   * asserting that authored diversity is a bug.
   *
   * What the corpus does demonstrate — and what is worth calibrating against
   * — is that recognisable cross-model equivalence **exists and is common**
   * where a turn's answers genuinely are restatements of one thing (a short
   * polite exchange, an "I agree, except that…" concession with the same
   * caveat phrased two ways). Measured: 44 of 107 multi-model turns (41%)
   * have an internal pair the grader recognises as equivalent at the current
   * threshold. The floor below asserts a third of that, not the whole of
   * it — high enough that a broken `meaningCoverage` or a threshold raised
   * out of reach would still be caught, low enough that ordinary content
   * growth (which will add more genuinely-divergent open turns, the same
   * shape as the 63 above) does not make this flaky.
   *
   * The vacuous self-check is kept too, as its own test below, reduced to a
   * one-line guard that `meaningCoverage` stays reflexive — not because it
   * says anything about calibration, but because a model scoring less than 1
   * against itself would mean the function itself is broken.
   */
  it('recognises a real cross-model paraphrase in a solid share of multi-model turns', () => {
    let turnsWithModels = 0;
    let turnsWithRecognisedPair = 0;

    for (const scene of conversations)
      for (const turn of scene.turns) {
        if (turn.speaker !== 'you' || !turn.accepted || turn.accepted.length < 2) continue;
        turnsWithModels += 1;

        let turnBest = 0;
        for (const model of turn.accepted) {
          const others = turn.accepted.filter((m) => m !== model);
          const bestCross = Math.max(...others.map((other) => meaningCoverage(model, other)));
          turnBest = Math.max(turnBest, bestCross);
        }
        if (turnBest >= COVERAGE_THRESHOLD) turnsWithRecognisedPair += 1;
      }

    // A mutation-style guard: if the corpus ever stopped carrying
    // multi-model turns at all, this would report a vacuous 100% on zero
    // turns rather than a real measurement.
    expect(turnsWithModels).toBeGreaterThan(5);
    const share = turnsWithRecognisedPair / turnsWithModels;
    expect(share).toBeGreaterThanOrEqual(0.3);
  });

  it('scores 1 for every authored model against itself (reflexivity guard)', () => {
    let worst = 1;
    for (const scene of conversations)
      for (const turn of scene.turns) {
        if (turn.speaker !== 'you' || !turn.accepted?.length) continue;
        for (const model of turn.accepted) worst = Math.min(worst, meaningCoverage(model, model));
      }
    expect(worst).toBe(1);
  });
});

/**
 * The other half.
 *
 * Every change in this pass makes the grader more permissive, and the failure
 * mode of permissiveness is silent: nothing breaks, tests stay green, and the
 * app quietly accepts answers that are wrong. Hand-written adversarial examples
 * only cover the examples somebody remembered, so these mutate the corpus
 * itself — the same six error classes the brief named, applied to every
 * sentence that can carry them.
 */
const MUTATIONS: { name: string; apply: (es: string) => string | null }[] = [
  {
    name: 'ser for estar',
    apply: (t) => {
      const swapped = t.replace(/\b(estoy|estás|está|estamos|estáis|están)\b/i, (m) =>
        ({ estoy: 'soy', estás: 'eres', está: 'es', estamos: 'somos', estáis: 'sois', están: 'son' })[
          m.toLowerCase()
        ] ?? m);
      return swapped === t ? null : swapped;
    },
  },
  {
    name: 'estar for ser',
    apply: (t) => {
      const swapped = t.replace(/\b(soy|eres|es|somos|sois|son)\b/i, (m) =>
        ({ soy: 'estoy', eres: 'estás', es: 'está', somos: 'estamos', sois: 'estáis', son: 'están' })[
          m.toLowerCase()
        ] ?? m);
      return swapped === t ? null : swapped;
    },
  },
  {
    name: 'por for para',
    apply: (t) => (/\bpara\b/.test(t) ? t.replace(/\bpara\b/, 'por') : null),
  },
  {
    name: 'para for por',
    apply: (t) => (/\bpor\b/.test(t) ? t.replace(/\bpor\b/, 'para') : null),
  },
  {
    name: 'negation removed',
    apply: (t) => (/\bno\b/.test(t) ? t.replace(/\bno\s+/, '') : null),
  },
  {
    name: 'negation added',
    apply: (t) => {
      const match = t.match(/^([A-ZÁÉÍÓÚÑ¿¡]?[^\s]*)\s(\S+)/);
      return match && !/\bno\b/.test(t) ? t.replace(/\s/, ' no ') : null;
    },
  },
  {
    name: 'plural for singular article',
    apply: (t) => (/\bel\s/.test(t) ? t.replace(/\bel\s/, 'los ') : null),
  },
  {
    name: 'gender flipped',
    apply: (t) => (/\bla\s/.test(t) ? t.replace(/\bla\s/, 'el ') : null),
  },
];

describe('permissiveness has a floor', () => {
  for (const mutation of MUTATIONS) {
    it(`never accepts: ${mutation.name}`, () => {
      const accepted: string[] = [];
      let tried = 0;

      for (const sentence of sentences) {
        const mutated = mutation.apply(sentence.es);
        if (mutated === null || mutated === sentence.es) continue;
        tried += 1;
        const result = checkAnswer(mutated, [sentence.es, ...(sentence.altEs ?? [])], es);
        if (result.verdict !== 'incorrect') {
          accepted.push(`${sentence.id} [${result.error}] "${mutated}" for "${sentence.es}"`);
        }
      }

      // A mutation that never fires tests nothing — fail loudly rather than
      // reporting a vacuous pass, which is how a guard rots.
      expect(tried).toBeGreaterThan(5);
      expect(accepted.slice(0, 10)).toEqual([]);
    });
  }
});
