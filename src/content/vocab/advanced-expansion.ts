import type { VocabConcept } from '@/content/types';

/**
 * B2, C1 and C2 material, because the course went shallow exactly where it got
 * hard.
 *
 * The audit's shallowness check compares what a stage *introduces* against the
 * course's busiest stage, and it found the top half of the course introducing
 * a sixth of what the bottom half does. That is the wrong shape for a
 * curriculum: a learner needs more support as the material gets more abstract,
 * not less, and a stage that thins out is one where progress stops feeling like
 * progress.
 *
 * What an advanced learner needs is not more nouns. It is the machinery for
 * *managing* a conversation — conceding a point without losing it, marking how
 * sure you are, repairing a misunderstanding, shifting register on purpose, and
 * the fixed expressions a native reaches for without thinking. So this file is
 * mostly chunks, and the chunks are mostly about stance and structure.
 *
 * Peninsular throughout, including the ones that would sound odd elsewhere:
 * `vale`, `venga`, `qué va`, `menudo`, `tela`.
 */
export const advancedExpansionVocab: VocabConcept[] = [
  // -------------------------------------------------------------------------
  // B2 — conceding, qualifying, and structuring an argument
  // -------------------------------------------------------------------------
  { id: 'p.eso-si', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'eso sí', en: 'mind you, that said', pos: 'expression', spainOnly: true, note: 'Adds the one reservation to something you have just agreed with.' },
  { id: 'p.de-todas-formas', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'de todas formas', en: 'in any case, anyway', pos: 'conjunction' },
  { id: 'p.al-fin-y-al-cabo', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'al fin y al cabo', en: 'at the end of the day', pos: 'expression' },
  { id: 'p.a-no-ser-que', kind: 'phrase', level: 'B2', topics: ['opinions', 'plans'], es: 'a no ser que', en: 'unless', pos: 'conjunction', note: 'Always subjunctive: a no ser que llueva.' },
  { id: 'p.en-cualquier-caso', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'en cualquier caso', en: 'in any event', pos: 'conjunction' },
  { id: 'v.el-motivo', kind: 'vocab', level: 'B2', topics: ['opinions', 'work'], es: 'el motivo', en: 'reason, motive', pos: 'noun', gender: 'm' },
  { id: 'v.la-causa', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'la causa', en: 'cause', pos: 'noun', gender: 'f' },
  { id: 'v.la-consecuencia', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'la consecuencia', en: 'consequence', pos: 'noun', gender: 'f' },
  { id: 'v.el-riesgo', kind: 'vocab', level: 'B2', topics: ['opinions', 'work'], es: 'el riesgo', en: 'risk', pos: 'noun', gender: 'm' },
  { id: 'v.la-medida', kind: 'vocab', level: 'B2', topics: ['work', 'opinions'], es: 'la medida', en: 'measure, step', pos: 'noun', gender: 'f' },
  { id: 'v.el-plazo', kind: 'vocab', level: 'B2', topics: ['work'], es: 'el plazo', en: 'deadline, period', pos: 'noun', gender: 'm' },
  { id: 'v.negar', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'negar', en: 'to deny', pos: 'verb', note: 'Negar que takes the subjunctive: no niego que sea difícil.' },
  { id: 'v.rechazar', kind: 'vocab', level: 'B2', topics: ['opinions', 'work'], es: 'rechazar', en: 'to reject, to turn down', pos: 'verb' },

  { id: 'v.el-ambito', kind: 'vocab', level: 'B2', topics: ['work', 'opinions'], es: 'el ámbito', en: 'field, sphere', pos: 'noun', gender: 'm' },
  { id: 'v.el-criterio', kind: 'vocab', level: 'B2', topics: ['opinions', 'work'], es: 'el criterio', en: 'criterion, judgement', pos: 'noun', gender: 'm' },
  { id: 'v.la-postura', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'la postura', en: 'position, stance', pos: 'noun', gender: 'f' },
  { id: 'v.el-hecho', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'el hecho', en: 'fact', pos: 'noun', gender: 'm', note: 'El hecho de que takes the subjunctive: el hecho de que sea caro…' },
  { id: 'v.la-prueba', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'la prueba', en: 'evidence, proof', pos: 'noun', gender: 'f' },
  { id: 'v.aportar', kind: 'vocab', level: 'B2', topics: ['work', 'opinions'], es: 'aportar', en: 'to contribute, to provide', pos: 'verb' },
  { id: 'v.descartar', kind: 'vocab', level: 'B2', topics: ['opinions', 'work'], es: 'descartar', en: 'to rule out', pos: 'verb' },
  { id: 'v.plantearse', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'plantearse', en: 'to consider, to wonder whether', pos: 'verb' },
  { id: 'p.a-mi-juicio', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'a mi juicio', en: 'in my judgement', pos: 'expression', register: 'formal' },
  { id: 'p.no-obstante', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'no obstante', en: 'nevertheless', pos: 'conjunction', register: 'formal' },

  // -------------------------------------------------------------------------
  // C1 — register, implication, and saying things sideways
  // -------------------------------------------------------------------------
  { id: 'p.no-es-para-tanto', kind: 'phrase', level: 'C1', topics: ['opinions', 'social'], es: 'no es para tanto', en: "it's not that big a deal", pos: 'expression', spainOnly: true },
  { id: 'p.ni-que-decir-tiene', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'ni que decir tiene', en: 'it goes without saying', pos: 'expression' },
  { id: 'p.a-decir-verdad', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'a decir verdad', en: 'to tell the truth', pos: 'expression' },
  { id: 'p.a-fin-de', kind: 'phrase', level: 'C1', topics: ['work', 'opinions'], es: 'a fin de', en: 'in order to', pos: 'conjunction', register: 'formal' },
  { id: 'p.en-aras-de', kind: 'phrase', level: 'C1', topics: ['work', 'opinions'], es: 'en aras de', en: 'for the sake of', pos: 'preposition', register: 'formal' },
  { id: 'p.tanto-mas-cuanto', kind: 'phrase', level: 'C1', topics: ['opinions'], es: 'tanto más cuanto que', en: 'all the more so because', pos: 'conjunction', register: 'formal' },
  { id: 'p.dejar-caer', kind: 'phrase', level: 'C1', topics: ['social', 'opinions'], es: 'dejar caer', en: 'to drop a hint', pos: 'expression', note: 'Literally to let something fall — saying it without saying it.' },
  { id: 'p.tirar-de-la-lengua', kind: 'phrase', level: 'C1', topics: ['social', 'slang'], es: 'tirar de la lengua', en: 'to draw someone out', pos: 'expression', spainOnly: true },
  { id: 'p.llevar-la-contraria', kind: 'phrase', level: 'C1', topics: ['social', 'opinions'], es: 'llevar la contraria', en: 'to contradict for the sake of it', pos: 'expression', spainOnly: true },
  { id: 'p.no-tener-desperdicio', kind: 'phrase', level: 'C1', topics: ['opinions', 'slang'], es: 'no tener desperdicio', en: 'to be worth every word', pos: 'expression', spainOnly: true },
  { id: 'v.el-matiz', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'el matiz', en: 'nuance, shade of meaning', pos: 'noun', gender: 'm' },
  { id: 'v.el-alcance', kind: 'vocab', level: 'C1', topics: ['work', 'opinions'], es: 'el alcance', en: 'scope, reach', pos: 'noun', gender: 'm' },
  { id: 'v.el-sesgo', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'el sesgo', en: 'bias, slant', pos: 'noun', gender: 'm' },
  { id: 'v.la-pauta', kind: 'vocab', level: 'C1', topics: ['work'], es: 'la pauta', en: 'guideline, pattern', pos: 'noun', gender: 'f' },
  { id: 'v.el-vinculo', kind: 'vocab', level: 'C1', topics: ['opinions', 'people'], es: 'el vínculo', en: 'link, bond', pos: 'noun', gender: 'm' },
  { id: 'v.acotar', kind: 'vocab', level: 'C1', topics: ['work', 'opinions'], es: 'acotar', en: 'to narrow down, to bound', pos: 'verb' },
  { id: 'v.esbozar', kind: 'vocab', level: 'C1', topics: ['work'], es: 'esbozar', en: 'to sketch out, to outline', pos: 'verb' },
  { id: 'v.recalcar', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'recalcar', en: 'to stress, to emphasise', pos: 'verb' },
  { id: 'v.soslayar', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'soslayar', en: 'to sidestep, to skirt', pos: 'verb', register: 'formal' },
  { id: 'v.subsanar', kind: 'vocab', level: 'C1', topics: ['work'], es: 'subsanar', en: 'to put right, to rectify', pos: 'verb', register: 'formal' },
  { id: 'v.escurridizo', kind: 'vocab', level: 'C1', topics: ['describing', 'opinions'], es: 'escurridizo / escurridiza', en: 'slippery, evasive', pos: 'adjective' },
  { id: 'v.tajante', kind: 'vocab', level: 'C1', topics: ['describing', 'opinions'], es: 'tajante', en: 'blunt, categorical', pos: 'adjective' },
  { id: 'v.escueto-adj', kind: 'vocab', level: 'C1', topics: ['describing'], es: 'sucinto / sucinta', en: 'succinct', pos: 'adjective' },

  { id: 'v.la-indole', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'la índole', en: 'nature, kind', pos: 'noun', gender: 'f', register: 'formal' },
  { id: 'v.el-planteamiento-c1', kind: 'vocab', level: 'C1', topics: ['work', 'opinions'], es: 'la premisa', en: 'premise', pos: 'noun', gender: 'f' },
  { id: 'v.la-salvedad', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'la salvedad', en: 'caveat, proviso', pos: 'noun', gender: 'f' },
  { id: 'v.el-desfase', kind: 'vocab', level: 'C1', topics: ['work'], es: 'el desfase', en: 'mismatch, gap', pos: 'noun', gender: 'm' },
  { id: 'v.ponderar', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'ponderar', en: 'to weigh, to speak highly of', pos: 'verb', register: 'formal' },
  { id: 'v.entrañar', kind: 'vocab', level: 'C1', topics: ['opinions', 'work'], es: 'entrañar', en: 'to entail', pos: 'verb', register: 'formal' },
  { id: 'v.eludir', kind: 'vocab', level: 'C1', topics: ['opinions'], es: 'eludir', en: 'to avoid, to evade', pos: 'verb' },
  { id: 'v.imprescindible', kind: 'vocab', level: 'C1', topics: ['describing', 'opinions'], es: 'imprescindible', en: 'essential, indispensable', pos: 'adjective' },
  { id: 'v.discutible', kind: 'vocab', level: 'C1', topics: ['describing', 'opinions'], es: 'discutible', en: 'debatable', pos: 'adjective' },
  { id: 'p.a-grandes-rasgos', kind: 'phrase', level: 'C1', topics: ['opinions', 'work'], es: 'a grandes rasgos', en: 'broadly speaking', pos: 'expression' },

  // -------------------------------------------------------------------------
  // C2 — the last mile: idiom, irony, and the words that carry a whole stance
  // -------------------------------------------------------------------------
  { id: 'p.no-dar-el-brazo-a-torcer', kind: 'phrase', level: 'C2', topics: ['social', 'opinions'], es: 'no dar el brazo a torcer', en: 'to refuse to back down', pos: 'expression', spainOnly: true },
  { id: 'p.buscarle-tres-pies', kind: 'phrase', level: 'C2', topics: ['slang', 'opinions'], es: 'buscarle tres pies al gato', en: 'to overcomplicate things', pos: 'expression', spainOnly: true },
  { id: 'p.a-toro-pasado', kind: 'phrase', level: 'C2', topics: ['opinions', 'storytelling'], es: 'a toro pasado', en: 'with hindsight', pos: 'expression', spainOnly: true, note: 'From bullfighting, like half of Spain’s best idioms.' },
  { id: 'p.no-tener-vuelta-de-hoja', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'no tener vuelta de hoja', en: 'to admit of no argument', pos: 'expression', spainOnly: true },
  { id: 'p.quitar-hierro', kind: 'phrase', level: 'C2', topics: ['social', 'opinions'], es: 'quitar hierro', en: 'to play something down', pos: 'expression', spainOnly: true },
  { id: 'p.pillar-el-toro', kind: 'phrase', level: 'C2', topics: ['work', 'slang'], es: 'pillar el toro', en: 'to run out of time', pos: 'expression', spainOnly: true, note: 'Me pilló el toro — the deadline caught me.' },
  { id: 'p.a-bombo-y-platillo', kind: 'phrase', level: 'C2', topics: ['social', 'opinions'], es: 'a bombo y platillo', en: 'with great fanfare', pos: 'expression', spainOnly: true },
  { id: 'p.de-perdidos-al-rio', kind: 'phrase', level: 'C2', topics: ['slang', 'opinions'], es: 'de perdidos al río', en: 'in for a penny, in for a pound', pos: 'expression', spainOnly: true },
  { id: 'p.sin-ir-mas-lejos', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'sin ir más lejos', en: 'to take just one example', pos: 'expression' },
  { id: 'v.el-empeno', kind: 'vocab', level: 'C2', topics: ['opinions', 'work'], es: 'el empeño', en: 'determination, insistence', pos: 'noun', gender: 'm' },
  { id: 'v.el-desenlace', kind: 'vocab', level: 'C2', topics: ['storytelling'], es: 'el desenlace', en: 'outcome, dénouement', pos: 'noun', gender: 'm' },
  { id: 'v.el-reparo', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'el reparo', en: 'misgiving, qualm', pos: 'noun', gender: 'm' },
  { id: 'v.el-cauce', kind: 'vocab', level: 'C2', topics: ['work'], es: 'el cauce', en: 'channel, proper procedure', pos: 'noun', gender: 'm', register: 'formal' },
  { id: 'v.enmendar', kind: 'vocab', level: 'C2', topics: ['work'], es: 'enmendar', en: 'to amend, to make good', pos: 'verb' },
  { id: 'v.sopesar', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'sopesar', en: 'to weigh up', pos: 'verb' },
  { id: 'v.desvirtuar', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'desvirtuar', en: 'to distort, to undermine', pos: 'verb', register: 'formal' },
  { id: 'v.ceñirse', kind: 'vocab', level: 'C2', topics: ['work', 'opinions'], es: 'ceñirse a', en: 'to stick to', pos: 'verb', note: 'Ceñirse al guion — stick to the script.' },
  { id: 'v.endeble', kind: 'vocab', level: 'C2', topics: ['describing', 'opinions'], es: 'endeble', en: 'flimsy, weak', pos: 'adjective' },
  { id: 'v.consabido', kind: 'vocab', level: 'C2', topics: ['describing'], es: 'consabido / consabida', en: 'the usual, the well-known', pos: 'adjective', note: 'Carries a faint eye-roll: el consabido debate.' },
  { id: 'v.aparente', kind: 'vocab', level: 'C2', topics: ['describing', 'opinions'], es: 'aparente', en: 'apparent, seeming', pos: 'adjective' },
  { id: 'v.paulatino', kind: 'vocab', level: 'C2', topics: ['describing'], es: 'paulatino / paulatina', en: 'gradual', pos: 'adjective', register: 'formal' },
];
