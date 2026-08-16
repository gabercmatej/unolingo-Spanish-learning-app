import type { VocabConcept } from '@/content/types';

/**
 * C1 language: idiom, irony, hedging, register and the machinery of
 * reformulation.
 *
 * Almost none of this is nameable vocabulary. It is the layer where Spanish
 * stops being a set of words and becomes a set of *moves* — signalling doubt,
 * distancing yourself from a claim, saying the opposite of what you mean and
 * trusting the listener to follow.
 */
export const c1CoreVocab: VocabConcept[] = [
  // --- Idioms in genuine circulation ---------------------------------------
  { id: 'p.merecer-la-pena-c1', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'no tener desperdicio', en: 'to be well worth it / to have nothing wasted in it', pos: 'expression', note: 'Often ironic about something absurd: su respuesta no tuvo desperdicio.' },
  { id: 'p.dar-la-lata', kind: 'phrase', level: 'C1', topics: ['slang'], es: 'dar la lata', en: 'to pester / to go on at someone', pos: 'expression', register: 'colloquial', spainOnly: true },
  { id: 'p.ponerse-las-pilas', kind: 'phrase', level: 'C1', topics: ['work', 'slang'], es: 'ponerse las pilas', en: 'to get one’s act together', pos: 'expression', register: 'colloquial' },
  { id: 'p.echar-una-mano', kind: 'phrase', level: 'C1', topics: ['social'], es: 'echar una mano', en: 'to give a hand', pos: 'expression' },
  { id: 'p.estar-en-las-nubes', kind: 'phrase', level: 'C1', topics: ['slang'], es: 'estar en las nubes', en: 'to have your head in the clouds', pos: 'expression', register: 'colloquial' },
  { id: 'p.no-tener-ni-idea', kind: 'phrase', level: 'C1', topics: ['slang'], es: 'no tener ni pajolera idea', en: 'to have no earthly idea', pos: 'expression', register: 'colloquial', spainOnly: true, note: 'Emphatic and very Spain. Milder: no tengo ni idea.' },
  { id: 'p.irse-por-las-ramas', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'irse por las ramas', en: 'to go off on a tangent', pos: 'expression' },
  { id: 'p.meter-la-pata', kind: 'phrase', level: 'C1', topics: ['social'], es: 'meter la pata', en: 'to put your foot in it', pos: 'expression', register: 'colloquial' },
  { id: 'p.a-regañadientes', kind: 'phrase', level: 'C1', topics: ['feelings'], es: 'a regañadientes', en: 'grudgingly', pos: 'expression' },
  { id: 'p.de-buenas-a-primeras', kind: 'phrase', level: 'C1', topics: ['storytelling'], es: 'de buenas a primeras', en: 'out of nowhere / just like that', pos: 'expression' },
  { id: 'p.a-duras-penas', kind: 'phrase', level: 'C1', topics: ['storytelling'], es: 'a duras penas', en: 'barely / with great difficulty', pos: 'expression' },
  { id: 'p.por-si-fuera-poco', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'por si fuera poco', en: 'as if that weren’t enough', pos: 'expression' },

  // --- Irony and implication -----------------------------------------------
  { id: 'p.menos-mal', kind: 'phrase', level: 'C1', topics: ['slang'], es: 'menos mal', en: 'just as well / thank goodness', pos: 'expression', register: 'colloquial' },
  { id: 'p.vaya-tela', kind: 'phrase', level: 'C1', topics: ['slang'], es: 'vaya tela', en: 'unbelievable / what a mess', pos: 'expression', register: 'colloquial', spainOnly: true, note: 'Almost always disapproving, however flat the delivery.' },
  { id: 'p.pues-si-que', kind: 'phrase', level: 'C1', topics: ['slang'], es: 'pues sí que…', en: 'well, that’s just great…', pos: 'expression', register: 'colloquial', note: 'Structurally positive, reliably sarcastic: pues sí que empezamos bien.' },
  { id: 'p.si-hombre', kind: 'phrase', level: 'C1', topics: ['slang'], es: 'sí, hombre, sí', en: 'yeah, right', pos: 'expression', register: 'colloquial', spainOnly: true, note: 'Agreement in form, refusal in meaning. Tone carries the whole thing.' },
  { id: 'p.no-te-digo-mas', kind: 'phrase', level: 'C1', topics: ['slang'], es: 'no te digo más', en: 'need I say more', pos: 'expression', register: 'colloquial' },
  { id: 'p.encima', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'encima', en: 'on top of that (indignant)', pos: 'adverb', register: 'colloquial', note: 'Carries grievance: y encima me lo cobraron.' },
  { id: 'p.ya-te-digo', kind: 'phrase', level: 'C1', topics: ['slang'], es: 'ya te digo', en: 'you can say that again', pos: 'expression', register: 'colloquial', spainOnly: true },

  // --- Hedging and distancing ----------------------------------------------
  { id: 'p.no-es-que', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'no es que… es que…', en: "it's not that… it's that…", pos: 'expression', note: 'The first clause takes the subjunctive, the second the indicative.' },
  { id: 'p.hasta-cierto-punto', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'hasta cierto punto', en: 'up to a point', pos: 'expression' },
  { id: 'p.en-cierto-modo', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'en cierto modo', en: 'in a way', pos: 'expression' },
  { id: 'p.dicho-esto', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'dicho esto', en: 'that said', pos: 'expression' },
  { id: 'p.si-bien', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'si bien', en: 'while / although', pos: 'expression', register: 'formal', note: 'Written register — you will read it far more than you hear it.' },
  { id: 'p.no-termina-de', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'no termina de…', en: 'it doesn’t quite…', pos: 'expression', note: 'The polite way to say something is bad: no termina de convencerme.' },
  { id: 'p.todo-hay-que-decirlo', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'todo hay que decirlo', en: 'it has to be said', pos: 'expression' },
  { id: 'p.por-lo-general', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'por lo general', en: 'generally speaking', pos: 'expression' },

  // --- Reformulating and structuring ---------------------------------------
  { id: 'p.dicho-de-otro-modo', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'dicho de otro modo', en: 'to put it another way', pos: 'expression' },
  { id: 'p.en-otras-palabras', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'en otras palabras', en: 'in other words', pos: 'expression' },
  { id: 'p.mas-bien', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'más bien', en: 'rather / if anything', pos: 'expression', note: 'Corrects a characterisation without contradicting it outright.' },
  { id: 'p.ahora-bien', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'ahora bien', en: 'that being said / however', pos: 'expression', register: 'formal' },
  { id: 'p.por-lo-tanto', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'por lo tanto', en: 'therefore', pos: 'expression', register: 'formal' },
  { id: 'p.en-la-medida-en-que', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'en la medida en que', en: 'insofar as', pos: 'expression', register: 'formal' },
  { id: 'p.a-raiz-de', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'a raíz de', en: 'as a result of / in the wake of', pos: 'expression', register: 'formal' },
  { id: 'p.siempre-y-cuando', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'siempre y cuando', en: 'provided that', pos: 'expression', note: 'Always subjunctive: siempre y cuando lo hagas bien.' },
  { id: 'p.de-ahi-que', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'de ahí que', en: 'hence / which is why', pos: 'expression', register: 'formal', note: 'Takes the subjunctive: de ahí que sea tan caro.' },

  // --- Register and style --------------------------------------------------
  { id: 'v.matiz', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'el matiz', en: 'the nuance', pos: 'noun', gender: 'm' },
  { id: 'v.tono', kind: 'vocab', level: 'C1', topics: ['opinions', 'social'], es: 'el tono', en: 'the tone', pos: 'noun', gender: 'm' },
  { id: 'v.indole', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'la índole', en: 'the nature / kind', pos: 'noun', gender: 'f', register: 'formal' },
  { id: 'v.ambito', kind: 'vocab', level: 'C1', topics: ['work'], es: 'el ámbito', en: 'the sphere / field', pos: 'noun', gender: 'm', register: 'formal' },
  { id: 'v.planteamiento', kind: 'vocab', level: 'C1', topics: ['work', 'opinions'], es: 'el planteamiento', en: 'the approach / framing', pos: 'noun', gender: 'm' },
  { id: 'v.enfoque', kind: 'vocab', level: 'C1', topics: ['work'], es: 'el enfoque', en: 'the angle / focus', pos: 'noun', gender: 'm' },
  { id: 'v.postura', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'la postura', en: 'the stance', pos: 'noun', gender: 'f' },
  { id: 'v.sesgo', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'el sesgo', en: 'the bias', pos: 'noun', gender: 'm' },
  { id: 'v.reticente', kind: 'vocab', level: 'C1', topics: ['feelings'], es: 'reticente', en: 'reluctant / guarded', pos: 'adjective' },
  { id: 'v.rotundo', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'rotundo / rotunda', en: 'emphatic / categorical', pos: 'adjective', note: 'un no rotundo — a flat refusal.' },
  { id: 'v.matizar', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'matizar', en: 'to qualify / to add nuance', pos: 'verb', note: 'Permítame que matice — the move that opens half of Spanish debate.' },
  { id: 'v.plantear', kind: 'vocab', level: 'C1', topics: ['work', 'opinions'], es: 'plantear', en: 'to raise / to put forward', pos: 'verb' },
  { id: 'v.asumir', kind: 'vocab', level: 'C1', topics: ['work'], es: 'asumir', en: 'to take on / to accept', pos: 'verb', note: 'A false friend: it rarely means "assume" in the English sense — that is suponer.' },
  { id: 'v.constatar', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'constatar', en: 'to verify / to note', pos: 'verb', register: 'formal' },
];
