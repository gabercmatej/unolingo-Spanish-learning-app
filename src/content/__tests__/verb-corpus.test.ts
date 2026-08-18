import { getSentence, verbFormConceptId, verbs } from '@/content';
import { paradigmUsage, personBearingToken, reportVerbCorpus } from '@/content/verb-corpus';
import { PERSONS } from '@/content/types';

/**
 * Ambiguity guards for the derived corpus index.
 *
 * The index earns its keep by deriving exposure from sentence text rather than
 * asking authors to tag paradigms. The risk that comes with that is silent
 * *inflation*: Spanish surfaces collide, so a naive match credits a paradigm
 * with evidence belonging to a different verb, a noun, or a conjunction — and
 * because the number looks healthy, nobody investigates.
 *
 * Every case below was a real defect measured on this corpus, not a
 * hypothetical. They are locked here because the failure mode is a number
 * quietly being too high, which no other test would ever notice.
 */

const usageOf = (verbId: string, tense: string) => paradigmUsage(verbFormConceptId(verbId, tense))!;
const textFor = (id: string) => getSentence(id)?.es ?? '';
const sentencesFor = (verbId: string, tense: string) => usageOf(verbId, tense).sentenceIds.map(textFor);

describe('verb corpus: cross-verb syncretism', () => {
  /**
   * ser and ir share their entire preterite — fui, fuiste, fue, fuimos,
   * fuisteis, fueron. Before the guard, both paradigms claimed the identical 32
   * sentences, so ser's preterite support was almost entirely `ir` in disguise.
   */
  it('does not credit ser with ir’s preterite, or the reverse', () => {
    const ser = usageOf('ser', 'preterite').sentenceIds;
    const ir = usageOf('ir', 'preterite').sentenceIds;
    expect(ser).not.toEqual(ir);
    // No sentence may support both readings of the same surface.
    expect(ser.filter((id) => ir.includes(id))).toEqual([]);
  });

  it('reads "Ayer fui al cine" as ir, because that is how it is tagged', () => {
    const line = 'Ayer fui al cine con Marta.';
    expect(sentencesFor('ir', 'preterite')).toContain(line);
    expect(sentencesFor('ser', 'preterite')).not.toContain(line);
  });

  it('keeps every pair of identically-conjugated paradigms disjoint', () => {
    /**
     * Two different verbs in one sentence is normal — "Tengo que darme prisa"
     * supports both tener and dar, and should. The thing that must never happen
     * is two paradigms whose *forms are the same string* both claiming the same
     * sentence, because then one of them is certainly wrong. ser and ir in the
     * preterite are the case that matters; the loop finds any other.
     */
    const twins: string[] = [];
    for (const a of verbs) {
      for (const b of verbs) {
        if (a.id >= b.id) continue;
        for (const tense of Object.keys(a.tenses)) {
          const fa = a.tenses[tense as keyof typeof a.tenses]?.forms;
          const fb = b.tenses[tense as keyof typeof b.tenses]?.forms;
          if (!fa || !fb) continue;
          const identical = PERSONS.every((p) => fa[p] === fb[p]);
          if (!identical) continue;

          const ua = paradigmUsage(verbFormConceptId(a.id, tense))!;
          const ub = paradigmUsage(verbFormConceptId(b.id, tense))!;
          const shared = ua.sentenceIds.filter((id) => ub.sentenceIds.includes(id));
          if (shared.length > 0) {
            twins.push(`${a.id}/${b.id}.${tense}: ${shared.length} shared`);
          }
        }
      }
    }
    expect(twins).toEqual([]);
  });
});

describe('verb corpus: noun and function-word homographs', () => {
  /** "el trabajo", "del trabajo", "por trabajo" are the noun, not trabajar. */
  it('excludes a form used as a noun behind a determiner or preposition', () => {
    const trabajar = sentencesFor('trabajar', 'present');
    for (const line of trabajar) {
      expect(line).not.toMatch(/\b(del|el|un|por|de|mucho) trabajo\b/i);
    }
    // …while genuine verb uses survive.
    expect(trabajar).toContain('Trabajo mucho, estudio poco y no leo nada.');
  });

  it('does not count glasses of wine as the preterite of venir', () => {
    for (const line of sentencesFor('venir', 'preterite')) {
      expect(line).not.toMatch(/\b(un|el|de) vino\b/i);
    }
  });

  it('does not count "la paga" as the present of pagar', () => {
    for (const line of sentencesFor('pagar', 'present')) {
      expect(line).not.toMatch(/\bla paga\b/i);
    }
  });

  /**
   * `como` is comer's yo form and one of the commonest words in Spanish. It is
   * the case neither automatic check catches, so it is corroborated by tag.
   */
  it('reads "como" as the conjunction unless the sentence is tagged as eating', () => {
    const comer = sentencesFor('comer', 'present');
    expect(comer).not.toContain('Mi piso no es tan grande como el tuyo.');
    expect(comer).not.toContain('Tiene los ojos muy claros, como su madre.');
    expect(comer).toContain('No como carne, pero sí pescado.');
  });

  it('keeps the corpus honest without gutting it', () => {
    // The guards must remove false positives, not real evidence: every taught
    // paradigm should still have something behind it.
    const report = reportVerbCorpus(() => true);
    expect(report.unsupported.length).toBe(0);
    expect(report.withSentenceSupport).toBe(report.taught);
  });
});

describe('verb corpus: person syncretism', () => {
  /**
   * `era` is both yo and él. Counting one sentence toward both persons doubles
   * the total and tells an author that `yo` is well covered when the evidence is
   * third-person narration.
   */
  it('counts a form shared between persons once, not once per person', () => {
    const report = reportVerbCorpus(() => true);
    const perPerson = PERSONS.reduce((sum, p) => sum + report.exposureByPerson[p], 0);
    const naive = verbs
      .flatMap((v) => Object.keys(v.tenses).map((t) => paradigmUsage(verbFormConceptId(v.id, t))))
      .filter(Boolean)
      .reduce((sum, u) => sum + PERSONS.reduce((n, p) => n + u!.byPerson[p].length, 0), 0);

    // Syncretism exists in this corpus, so the honest count must be lower.
    expect(report.sharedFormExposures).toBeGreaterThan(0);
    expect(perPerson).toBeLessThan(naive);
    expect(perPerson + report.sharedFormExposures).toBeLessThanOrEqual(naive);
  });

  it('still reports a syncretic paradigm as covering both persons', () => {
    // The form genuinely attests both; only the aggregate count is deduped.
    const imperfect = usageOf('ser', 'imperfect');
    expect(imperfect.byPerson.yo.length).toBeGreaterThan(0);
    expect(imperfect.byPerson.el.length).toBeGreaterThan(0);
  });
});

describe('verb corpus: multi-word forms', () => {
  it('puts the blank on the token that carries the person', () => {
    expect(personBearingToken('he comido')).toBe('he');
    expect(personBearingToken('habéis comido')).toBe('habéis');
    expect(personBearingToken('me levanto')).toBe('levanto');
    expect(personBearingToken('os levantáis')).toBe('levantáis');
    expect(personBearingToken('hablo')).toBe('hablo');
  });

  it('matches compound and reflexive forms as whole sequences', () => {
    // "he comido" must not match a sentence containing only "he".
    const perfect = usageOf('comer', 'presentPerfect');
    for (const id of perfect.byPerson.yo) {
      expect(textFor(id).toLowerCase()).toContain('he comido');
    }
    const reflexive = usageOf('levantarse', 'present');
    expect(reflexive.sentenceIds.length).toBeGreaterThan(0);
  });
});
