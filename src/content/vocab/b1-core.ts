import type { VocabConcept } from '@/content/types';

/**
 * B1 vocabulary: emotions with some range, work and study, giving advice,
 * complaining, and the connectors that let a paragraph hold together.
 *
 * Heavy on chunks. At B1 the gap between a learner and a speaker is rarely
 * missing nouns — it is not having the ready-made phrases that native speakers
 * reach for without thinking.
 */
export const b1CoreVocab: VocabConcept[] = [
  // --- Emotions with range -------------------------------------------------
  { id: 'v.preocupado', kind: 'vocab', level: 'B1', topics: ['feelings'], es: 'preocupado / preocupada', en: 'worried', pos: 'adjective' },
  { id: 'v.orgulloso', kind: 'vocab', level: 'B1', topics: ['feelings'], es: 'orgulloso / orgullosa', en: 'proud', pos: 'adjective' },
  { id: 'v.decepcionado', kind: 'vocab', level: 'B1', topics: ['feelings'], es: 'decepcionado / decepcionada', en: 'disappointed', pos: 'adjective' },
  { id: 'v.agobiado', kind: 'vocab', level: 'B1', topics: ['feelings'], es: 'agobiado / agobiada', en: 'overwhelmed / stressed out', pos: 'adjective', spainOnly: true, note: 'The word Spain reaches for when life is too much. Estoy agobiado is heard daily.' },
  { id: 'v.harto', kind: 'vocab', level: 'B1', topics: ['feelings'], es: 'harto / harta', en: 'fed up', pos: 'adjective', register: 'colloquial', note: 'estar harto de algo — fed up with something.' },
  {
    id: 'p.me-da-pena',
    kind: 'phrase',
    level: 'B1',
    topics: ['feelings'],
    es: 'me da pena',
    en: 'it makes me sad / I feel sorry',
    pos: 'expression',
    note: 'The dar family works like gustar: me da miedo, me da rabia, me da igual.',
  },
  { id: 'p.me-da-miedo', kind: 'phrase', level: 'B1', topics: ['feelings'], es: 'me da miedo', en: 'it scares me', pos: 'expression' },
  { id: 'p.me-da-rabia', kind: 'phrase', level: 'B1', topics: ['feelings'], es: 'me da rabia', en: 'it makes me angry', pos: 'expression', register: 'colloquial' },
  { id: 'p.me-preocupa', kind: 'phrase', level: 'B1', topics: ['feelings', 'opinions'], es: 'me preocupa que…', en: 'it worries me that…', pos: 'expression', note: 'Takes the subjunctive after que — one of the emotion triggers.' },
  { id: 'p.estoy-hasta', kind: 'phrase', level: 'B1', topics: ['feelings', 'slang'], es: 'estoy hasta las narices', en: "I've had it up to here", pos: 'expression', register: 'colloquial', spainOnly: true },

  // --- Work and study ------------------------------------------------------
  { id: 'v.empresa', kind: 'vocab', level: 'B1', topics: ['work'], es: 'la empresa', en: 'the company', pos: 'noun', gender: 'f' },
  { id: 'v.jefe', kind: 'vocab', level: 'B1', topics: ['work'], es: 'el jefe / la jefa', en: 'the boss', pos: 'noun', gender: 'mf' },
  { id: 'v.sueldo', kind: 'vocab', level: 'B1', topics: ['work'], es: 'el sueldo', en: 'the salary', pos: 'noun', gender: 'm' },
  { id: 'v.reunion', kind: 'vocab', level: 'B1', topics: ['work'], es: 'la reunión', en: 'the meeting', pos: 'noun', gender: 'f' },
  { id: 'v.horario', kind: 'vocab', level: 'B1', topics: ['work', 'time'], es: 'el horario', en: 'the schedule / opening hours', pos: 'noun', gender: 'm', note: 'Spanish life is organised around horarios — shop, work and school hours all differ from northern Europe.' },
  { id: 'v.carrera', kind: 'vocab', level: 'B1', topics: ['university'], es: 'la carrera', en: 'the degree / the career', pos: 'noun', gender: 'f', note: 'Both meanings: estudio una carrera is a degree course.' },
  { id: 'v.asignatura', kind: 'vocab', level: 'B1', topics: ['university'], es: 'la asignatura', en: 'the subject (at school)', pos: 'noun', gender: 'f' },
  { id: 'v.aprobar', kind: 'vocab', level: 'B1', topics: ['university'], es: 'aprobar', en: 'to pass (an exam)', pos: 'verb', confusableWith: ['v.suspender'] },
  { id: 'v.suspender', kind: 'vocab', level: 'B1', topics: ['university'], es: 'suspender', en: 'to fail (an exam)', pos: 'verb', spainOnly: true, regional: { spain: 'he suspendido', latam: 'reprobé', note: 'Spain suspende, much of Latin America reprueba.' } },
  { id: 'p.buscar-trabajo', kind: 'phrase', level: 'B1', topics: ['work'], es: 'buscar trabajo', en: 'to look for work', pos: 'expression' },
  { id: 'p.echar-un-curriculum', kind: 'phrase', level: 'B1', topics: ['work'], es: 'echar un currículum', en: 'to put in a CV', pos: 'expression', spainOnly: true },

  // --- Advice and suggestions ---------------------------------------------
  { id: 'p.deberias', kind: 'phrase', level: 'B1', topics: ['opinions', 'social'], es: 'deberías…', en: 'you should…', pos: 'expression', note: 'The conditional of deber — the standard way to give advice without ordering.' },
  { id: 'p.yo-que-tu', kind: 'phrase', level: 'B1', topics: ['opinions', 'social'], es: 'yo que tú…', en: 'if I were you…', pos: 'expression', register: 'colloquial', note: 'Followed by the conditional: yo que tú, no iría.' },
  { id: 'p.por-que-no', kind: 'phrase', level: 'B1', topics: ['social', 'plans'], es: '¿Por qué no…?', en: 'why don’t you…?', pos: 'expression' },
  { id: 'p.lo-mejor-es', kind: 'phrase', level: 'B1', topics: ['opinions'], es: 'lo mejor es…', en: 'the best thing is…', pos: 'expression' },
  { id: 'p.te-recomiendo', kind: 'phrase', level: 'B1', topics: ['opinions'], es: 'te recomiendo que…', en: 'I recommend that you…', pos: 'expression', note: 'Another subjunctive trigger — te recomiendo que vayas.' },
  { id: 'p.merece-la-pena', kind: 'phrase', level: 'B1', topics: ['opinions'], es: 'merece la pena', en: "it's worth it", pos: 'expression' },

  // --- Complaining and problems -------------------------------------------
  { id: 'v.quejarse', kind: 'vocab', level: 'B1', topics: ['opinions'], es: 'quejarse', en: 'to complain', pos: 'verb' },
  { id: 'v.averiado', kind: 'vocab', level: 'B1', topics: ['travel'], es: 'averiado / averiada', en: 'broken down / out of order', pos: 'adjective' },
  { id: 'v.retraso', kind: 'vocab', level: 'B1', topics: ['transport', 'travel'], es: 'el retraso', en: 'the delay', pos: 'noun', gender: 'm' },
  { id: 'p.no-funciona', kind: 'phrase', level: 'B1', topics: ['travel'], es: 'no funciona', en: "it doesn't work", pos: 'expression' },
  { id: 'p.hay-un-problema', kind: 'phrase', level: 'B1', topics: ['travel'], es: 'hay un problema con…', en: "there's a problem with…", pos: 'expression' },
  { id: 'p.me-han-cobrado', kind: 'phrase', level: 'B1', topics: ['shopping'], es: 'me han cobrado de más', en: "I've been overcharged", pos: 'expression' },
  { id: 'p.querria-devolver', kind: 'phrase', level: 'B1', topics: ['shopping'], es: 'querría devolver esto', en: "I'd like to return this", pos: 'expression', register: 'formal' },
  { id: 'p.lo-siento-mucho', kind: 'phrase', level: 'B1', topics: ['social'], es: 'lo siento mucho', en: "I'm really sorry", pos: 'expression' },

  // --- Chunks and collocations --------------------------------------------
  { id: 'p.darse-cuenta', kind: 'phrase', level: 'B1', topics: ['storytelling'], es: 'darse cuenta de', en: 'to realise', pos: 'expression', note: 'Always with de: me di cuenta de que…. Not the same as realizar, which means to carry out.' },
  { id: 'p.tener-ganas', kind: 'phrase', level: 'B1', topics: ['plans', 'feelings'], es: 'tener ganas de', en: 'to be looking forward to / to feel like', pos: 'expression' },
  { id: 'p.echar-de-menos', kind: 'phrase', level: 'B1', topics: ['feelings'], es: 'echar de menos', en: 'to miss (someone)', pos: 'expression', spainOnly: true, regional: { spain: 'te echo de menos', latam: 'te extraño', note: 'Spain says echar de menos; Latin America says extrañar.' } },
  { id: 'p.tener-razon', kind: 'phrase', level: 'B1', topics: ['opinions'], es: 'tener razón', en: 'to be right', pos: 'expression', note: 'You have reason, you are not right — tienes razón.' },
  { id: 'p.darse-prisa', kind: 'phrase', level: 'B1', topics: ['daily-routine'], es: 'darse prisa', en: 'to hurry up', pos: 'expression' },
  { id: 'p.llevarse-bien', kind: 'phrase', level: 'B1', topics: ['social', 'people'], es: 'llevarse bien con', en: 'to get on well with', pos: 'expression' },
  { id: 'p.pasarlo-bien', kind: 'phrase', level: 'B1', topics: ['social'], es: 'pasarlo bien', en: 'to have a good time', pos: 'expression', spainOnly: true, note: 'Spain says pasarlo bien; you will also hear pasarla bien elsewhere.' },
  { id: 'p.echar-un-vistazo', kind: 'phrase', level: 'B1', topics: ['work'], es: 'echar un vistazo', en: 'to have a quick look', pos: 'expression' },
  { id: 'p.tomar-una-decision', kind: 'phrase', level: 'B1', topics: ['work', 'opinions'], es: 'tomar una decisión', en: 'to make a decision', pos: 'expression', note: 'Taken, not made — hacer una decisión is a direct translation that no one says.' },
  { id: 'p.prestar-atencion', kind: 'phrase', level: 'B1', topics: ['university'], es: 'prestar atención', en: 'to pay attention', pos: 'expression' },
  { id: 'p.no-pasa-nada', kind: 'phrase', level: 'B1', topics: ['social'], es: 'no pasa nada', en: "it's fine / no worries", pos: 'expression', register: 'colloquial', note: 'The universal Spanish reassurance — apology, mishap, anything.' },
  { id: 'p.valer-la-pena', kind: 'phrase', level: 'B1', topics: ['opinions'], es: 'por lo visto', en: 'apparently', pos: 'expression' },

  // --- Connectors that build a paragraph ----------------------------------
  { id: 'v.sin-embargo', kind: 'vocab', level: 'B1', topics: ['opinions'], es: 'sin embargo', en: 'however', pos: 'conjunction' },
  { id: 'v.ademas', kind: 'vocab', level: 'B1', topics: ['opinions'], es: 'además', en: 'besides / what’s more', pos: 'adverb' },
  { id: 'v.por-eso', kind: 'vocab', level: 'B1', topics: ['opinions'], es: 'por eso', en: 'that’s why', pos: 'conjunction' },
  { id: 'v.mientras', kind: 'vocab', level: 'B1', topics: ['storytelling'], es: 'mientras', en: 'while', pos: 'conjunction' },
  { id: 'v.de-repente', kind: 'vocab', level: 'B1', topics: ['storytelling'], es: 'de repente', en: 'suddenly', pos: 'adverb', note: 'The word that pushes a story from imperfect into preterite.' },
  { id: 'v.al-final', kind: 'vocab', level: 'B1', topics: ['storytelling'], es: 'al final', en: 'in the end', pos: 'adverb' },
  { id: 'v.en-cambio', kind: 'vocab', level: 'B1', topics: ['opinions'], es: 'en cambio', en: 'on the other hand', pos: 'conjunction' },
  { id: 'v.o-sea', kind: 'vocab', level: 'B1', topics: ['slang'], es: 'o sea', en: 'I mean / in other words', pos: 'expression', register: 'colloquial', spainOnly: true, note: 'Spain’s all-purpose reformulator, roughly once a sentence.' },
];
