import type { VocabConcept } from '@/content/types';

/**
 * B2 language: arguing, conceding, hedging, speculating and softening.
 *
 * Almost all chunks. At B2 what separates a learner from a speaker is not
 * vocabulary size but the connective tissue of an argument — the phrases that
 * signal "I'm about to disagree", "I'm not certain", "let me rephrase that".
 */
export const b2CoreVocab: VocabConcept[] = [
  // --- Building and defending an argument ----------------------------------
  { id: 'p.en-mi-opinion', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'en mi opinión', en: 'in my opinion', pos: 'expression' },
  { id: 'p.desde-mi-punto', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'desde mi punto de vista', en: 'from my point of view', pos: 'expression' },
  { id: 'p.lo-que-pasa-es', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'lo que pasa es que…', en: 'the thing is…', pos: 'expression', register: 'colloquial', note: 'How Spaniards introduce the real objection, usually after appearing to agree.' },
  { id: 'p.por-un-lado', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'por un lado… por otro lado…', en: 'on one hand… on the other…', pos: 'expression' },
  { id: 'p.hay-que-tener-en-cuenta', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'hay que tener en cuenta que…', en: 'you have to bear in mind that…', pos: 'expression' },
  { id: 'p.en-realidad', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'en realidad', en: 'actually / in fact', pos: 'expression' },
  { id: 'p.de-hecho', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'de hecho', en: 'in fact', pos: 'expression' },
  { id: 'p.a-fin-de-cuentas', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'a fin de cuentas', en: 'at the end of the day', pos: 'expression' },
  { id: 'p.la-ventaja-es', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'la ventaja / la desventaja es que…', en: 'the advantage / drawback is that…', pos: 'expression' },

  // --- Disagreeing and conceding -------------------------------------------
  { id: 'p.no-estoy-de-acuerdo', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'no estoy de acuerdo con…', en: "I don't agree with…", pos: 'expression' },
  { id: 'p.puede-ser-pero', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'puede ser, pero…', en: 'maybe, but…', pos: 'expression', note: 'The standard concede-then-object move. Almost never omitted before a disagreement.' },
  { id: 'p.estoy-de-acuerdo-en-parte', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'estoy de acuerdo en parte', en: 'I partly agree', pos: 'expression' },
  { id: 'p.no-lo-veo-asi', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'yo no lo veo así', en: "I don't see it that way", pos: 'expression', register: 'colloquial' },
  { id: 'p.a-pesar-de', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'a pesar de que…', en: 'despite the fact that…', pos: 'expression' },
  { id: 'p.aun-asi', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'aun así', en: 'even so', pos: 'expression' },
  { id: 'p.por-mucho-que', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'por mucho que…', en: 'however much…', pos: 'expression', note: 'Takes the subjunctive: por mucho que insistas.' },

  // --- Hedging and speculating ---------------------------------------------
  { id: 'p.supongo-que', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'supongo que…', en: 'I suppose…', pos: 'expression' },
  { id: 'p.puede-que', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'puede que…', en: 'it may be that…', pos: 'expression', note: 'Always subjunctive after it: puede que venga.' },
  { id: 'p.a-lo-mejor', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'a lo mejor', en: 'maybe', pos: 'expression', register: 'colloquial', spainOnly: true, note: 'Very Spain, and unusually takes the indicative: a lo mejor viene.' },
  { id: 'p.igual-viene', kind: 'phrase', level: 'B2', topics: ['opinions', 'slang'], es: 'igual…', en: 'maybe…', pos: 'expression', register: 'colloquial', spainOnly: true, note: 'In Spain igual often means "maybe", not "equally": igual llega tarde.' },
  { id: 'p.me-imagino-que', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'me imagino que…', en: 'I imagine that…', pos: 'expression' },
  { id: 'p.no-me-extrana', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'no me extraña', en: "I'm not surprised", pos: 'expression', register: 'colloquial' },
  { id: 'p.por-lo-que-parece', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'por lo que parece', en: 'from what it looks like', pos: 'expression' },

  // --- Discourse markers that buy you time ---------------------------------
  { id: 'p.la-verdad-es-que', kind: 'phrase', level: 'B2', topics: ['slang', 'opinions'], es: 'la verdad es que…', en: 'to be honest…', pos: 'expression', register: 'colloquial' },
  { id: 'p.o-sea-que', kind: 'phrase', level: 'B2', topics: ['slang'], es: 'o sea, que…', en: 'so basically…', pos: 'expression', register: 'colloquial' },
  { id: 'p.es-decir', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'es decir', en: 'that is to say', pos: 'expression' },
  { id: 'p.en-plan-b2', kind: 'phrase', level: 'B2', topics: ['slang'], es: 'total, que…', en: 'anyway, so…', pos: 'expression', register: 'colloquial', spainOnly: true, note: 'How a Spaniard resumes a story after a digression.' },
  { id: 'p.por-cierto', kind: 'phrase', level: 'B2', topics: ['social'], es: 'por cierto', en: 'by the way', pos: 'expression' },
  { id: 'p.venga-ya', kind: 'phrase', level: 'B2', topics: ['slang'], es: '¡venga ya!', en: 'oh come on!', pos: 'expression', register: 'colloquial', spainOnly: true, note: 'Disbelief, not encouragement — tone carries it.' },
  { id: 'p.ni-de-broma', kind: 'phrase', level: 'B2', topics: ['slang'], es: 'ni de broma', en: 'no way', pos: 'expression', register: 'colloquial' },

  // --- Summarising and reporting -------------------------------------------
  { id: 'p.en-resumen', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'en resumen', en: 'in short', pos: 'expression' },
  { id: 'p.resumiendo', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'resumiendo', en: 'to sum up', pos: 'expression' },
  { id: 'p.segun', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'según…', en: 'according to…', pos: 'expression' },
  { id: 'p.me-comento-que', kind: 'phrase', level: 'B2', topics: ['work', 'social'], es: 'me comentó que…', en: 'he mentioned that…', pos: 'expression' },
  { id: 'p.al-parecer', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'al parecer', en: 'apparently', pos: 'expression' },
  { id: 'v.dato', kind: 'vocab', level: 'B2', topics: ['work', 'opinions'], es: 'el dato', en: 'the fact / the piece of data', pos: 'noun', gender: 'm' },
  { id: 'v.medida', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'la medida', en: 'the measure (policy)', pos: 'noun', gender: 'f' },

  // --- Abstract topics you can now discuss ---------------------------------
  { id: 'v.medioambiente', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'el medio ambiente', en: 'the environment', pos: 'noun', gender: 'm' },
  { id: 'v.desigualdad', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'la desigualdad', en: 'inequality', pos: 'noun', gender: 'f' },
  { id: 'v.vivienda', kind: 'vocab', level: 'B2', topics: ['opinions', 'home'], es: 'la vivienda', en: 'housing', pos: 'noun', gender: 'f', note: 'El precio de la vivienda is a permanent conversation topic in Spain.' },
  { id: 'v.alquiler', kind: 'vocab', level: 'B2', topics: ['home'], es: 'el alquiler', en: 'the rent', pos: 'noun', gender: 'm' },
  { id: 'v.paro', kind: 'vocab', level: 'B2', topics: ['work', 'opinions'], es: 'el paro', en: 'unemployment', pos: 'noun', gender: 'm', spainOnly: true, regional: { spain: 'estar en el paro', latam: 'estar desempleado', note: 'Spain says el paro for both unemployment and unemployment benefit.' } },
  { id: 'v.red-social', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'las redes sociales', en: 'social media', pos: 'noun', gender: 'f' },
  { id: 'v.noticia', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'la noticia', en: 'the news story', pos: 'noun', gender: 'f', note: 'Singular for one story, las noticias for the news bulletin.' },
  { id: 'v.polemica', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'la polémica', en: 'the controversy', pos: 'noun', gender: 'f' },
  { id: 'v.aumentar', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'aumentar', en: 'to increase', pos: 'verb', confusableWith: ['v.reducir'] },
  { id: 'v.reducir', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'reducir', en: 'to reduce', pos: 'verb' },
  { id: 'v.exigir', kind: 'vocab', level: 'B2', topics: ['work', 'opinions'], es: 'exigir', en: 'to demand', pos: 'verb', note: 'Takes the subjunctive: exigen que trabajemos más.' },
  { id: 'v.lograr', kind: 'vocab', level: 'B2', topics: ['work'], es: 'lograr', en: 'to manage to / to achieve', pos: 'verb' },
  { id: 'p.llevar-a-cabo', kind: 'phrase', level: 'B2', topics: ['work'], es: 'llevar a cabo', en: 'to carry out', pos: 'expression' },
  { id: 'p.tener-en-cuenta', kind: 'phrase', level: 'B2', topics: ['work', 'opinions'], es: 'tener en cuenta', en: 'to take into account', pos: 'expression' },
];
