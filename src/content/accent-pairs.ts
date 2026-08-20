import { sentences, vocabConcepts } from '@/content';
import { conversations } from '@/content/conversations';
import { errorDrills, naturalDrills } from '@/content/drills';
import { verbs } from '@/content/verbs';

/**
 * Which accents carry meaning, derived rather than listed.
 *
 * `deaccent` folds every accent before comparing, which is right for a phone
 * keyboard and wrong for `hablo` against `habló`. `CLAUDE.md` recorded that as
 * unsolvable without knowing which words are verbs. It is solvable without
 * knowing anything of the sort: the question is not "is this a verb?" but "does
 * this string, stripped of accents, name more than one real Spanish word?" —
 * and the corpus answers that itself, the same way `verb-corpus.ts` derives
 * which sentences contain which conjugated form.
 *
 * Walk Spanish text, group every surface word by its deaccented form, and keep
 * the groups holding two or more distinct spellings. 3,397 words collapse to 65
 * groups, and every one is a genuine minimal pair: the diacritical set
 * (qué/que, él/el, sí/si, cómo/como), demonstrative against verb (está/esta),
 * present yo against preterite él (hablo/habló), subjunctive against preterite
 * yo (hable/hablé).
 *
 * **Spanish text only, and that is load-bearing.** An earlier version read every
 * string literal in `content/` and found 107 groups — because it was also
 * reading the English glosses (opinion, decision, reunion) and the ASCII slugs
 * in ids (espanol, anos, manana). That set would have made años, español and
 * mañana accent-critical, punishing a learner for the one thing a phone
 * keyboard genuinely makes hard. Restricted to Spanish, café, años, español,
 * mañana, niño and jardín all fall outside it, which is the point.
 *
 * Adding content updates this automatically. Nothing is annotated.
 */

const SPANISH_WORD = /[a-záéíóúüñ]+/g;

function deaccent(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function spanishText(): string[] {
  const out: string[] = [];

  for (const sentence of sentences) {
    out.push(sentence.es);
    if (sentence.altEs) out.push(...sentence.altEs);
  }

  for (const concept of vocabConcepts) out.push(concept.es);

  for (const drill of errorDrills) {
    out.push(drill.wrong, ...drill.accepted);
  }

  for (const drill of naturalDrills) {
    for (const option of drill.options) out.push(option.es);
  }

  for (const scene of conversations) {
    for (const turn of scene.turns) {
      if (turn.es) out.push(turn.es);
      if (turn.accepted) out.push(...turn.accepted);
    }
  }

  // Conjugated forms, so a paradigm the corpus has not used in a sentence yet
  // still contributes its own minimal pairs.
  for (const verb of verbs) {
    for (const conjugation of Object.values(verb.tenses)) {
      if (!conjugation) continue;
      for (const form of Object.values(conjugation.forms)) {
        if (typeof form === 'string') out.push(form);
      }
    }
  }

  return out;
}

function derive(): Set<string> {
  const byBare = new Map<string, Set<string>>();

  for (const text of spanishText()) {
    for (const word of text.toLowerCase().match(SPANISH_WORD) ?? []) {
      const bare = deaccent(word);
      let forms = byBare.get(bare);
      if (!forms) {
        forms = new Set();
        byBare.set(bare, forms);
      }
      forms.add(word);
    }
  }

  const ambiguous = new Set<string>();
  for (const [bare, forms] of byBare) {
    if (forms.size > 1) ambiguous.add(bare);
  }
  return ambiguous;
}

/** Deaccented forms that name more than one real word in this course. */
export const ACCENT_AMBIGUOUS: ReadonlySet<string> = derive();

/**
 * Does an accent on this word change which word it is? Accepts either spelling —
 * the set is keyed by the deaccented form, so `está` and `esta` both answer true.
 */
export function accentCarriesMeaning(word: string): boolean {
  return ACCENT_AMBIGUOUS.has(deaccent(word.toLowerCase()));
}
