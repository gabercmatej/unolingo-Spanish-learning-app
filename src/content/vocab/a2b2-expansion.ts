import type { VocabConcept } from '@/content/types';

/**
 * The A2–B2 expansion: the verbs that carry narration and argument, and the
 * everyday world the course could not describe.
 *
 * Two gaps the coverage audit found, and they are different in kind. The
 * vocabulary one is blunt — "A2 The city and services: 1 of 14 covered" meant
 * the course had no word for bank, hospital, park, museum, cinema or
 * restaurant, which is most of a town. The verb one is structural: the
 * conjugation system was complete and running on 34 verbs, none of which were
 * *creer*, *parecer*, *dejar* or *conseguir* — so a learner could conjugate
 * flawlessly and still not say what they thought.
 *
 * The verbs here are vocabulary entries pointing at conjugation tables in
 * `verbs-core.ts`. Both halves are needed: the table makes the paradigm
 * practisable, and the entry makes the word findable in the Library.
 */
export const a2b2ExpansionVocab: VocabConcept[] = [
  // --- Verbs: A2 -----------------------------------------------------------
  { id: 'v.volver', kind: 'vocab', level: 'A2', topics: ['daily-routine', 'travel'], es: 'volver', en: 'to return, to go back', pos: 'verb', verbId: 'volver', note: 'Volver a + infinitivo is how Spanish says "do something again": vuelvo a llamarte.' },
  { id: 'v.pensar', kind: 'vocab', level: 'A2', topics: ['opinions'], es: 'pensar', en: 'to think', pos: 'verb', verbId: 'pensar', confusableWith: ['v.creer', 'v.parecer'] },
  { id: 'v.entender', kind: 'vocab', level: 'A2', topics: ['social', 'university'], es: 'entender', en: 'to understand', pos: 'verb', verbId: 'entender' },
  { id: 'v.perder', kind: 'vocab', level: 'A2', topics: ['transport', 'daily-routine'], es: 'perder', en: 'to lose, to miss', pos: 'verb', verbId: 'perder', note: 'Also "to miss" a train or a plane — perder el tren.' },
  { id: 'v.jugar', kind: 'vocab', level: 'A2', topics: ['hobbies'], es: 'jugar', en: 'to play', pos: 'verb', verbId: 'jugar', note: 'For a game or sport. Playing an instrument is tocar.' },
  { id: 'v.sentir', kind: 'vocab', level: 'A2', topics: ['feelings'], es: 'sentir', en: 'to feel, to be sorry', pos: 'verb', verbId: 'sentir' },
  { id: 'v.contar', kind: 'vocab', level: 'A2', topics: ['storytelling'], es: 'contar', en: 'to tell, to count', pos: 'verb', verbId: 'contar', note: 'Contar con alguien is to count on someone.' },
  { id: 'v.recordar', kind: 'vocab', level: 'A2', topics: ['storytelling'], es: 'recordar', en: 'to remember', pos: 'verb', verbId: 'recordar' },
  { id: 'v.olvidar', kind: 'vocab', level: 'A2', topics: ['daily-routine'], es: 'olvidar', en: 'to forget', pos: 'verb', verbId: 'olvidar', note: 'Spain usually says se me ha olvidado — the thing forgot itself on you.' },
  { id: 'v.cambiar', kind: 'vocab', level: 'A2', topics: ['daily-routine'], es: 'cambiar', en: 'to change', pos: 'verb', verbId: 'cambiar' },
  { id: 'v.ganar', kind: 'vocab', level: 'A2', topics: ['hobbies', 'work'], es: 'ganar', en: 'to win, to earn', pos: 'verb', verbId: 'ganar' },
  { id: 'v.intentar', kind: 'vocab', level: 'A2', topics: ['plans'], es: 'intentar', en: 'to try', pos: 'verb', verbId: 'intentar' },

  // --- Verbs: B1 -----------------------------------------------------------
  { id: 'v.parecer', kind: 'vocab', level: 'B1', topics: ['opinions', 'describing'], es: 'parecer', en: 'to seem, to look like', pos: 'verb', verbId: 'parecer', note: 'Me parece que… is the everyday way to give an opinion, softer than creo que.' },
  { id: 'v.creer', kind: 'vocab', level: 'B1', topics: ['opinions'], es: 'creer', en: 'to believe, to think', pos: 'verb', verbId: 'creer', note: 'Creo que takes the indicative; no creo que takes the subjunctive.' },
  { id: 'v.conseguir', kind: 'vocab', level: 'B1', topics: ['work', 'plans'], es: 'conseguir', en: 'to get, to manage to', pos: 'verb', verbId: 'conseguir' },
  { id: 'v.servir', kind: 'vocab', level: 'B1', topics: ['restaurant', 'opinions'], es: 'servir', en: 'to serve, to be useful', pos: 'verb', verbId: 'servir' },
  { id: 'v.mover', kind: 'vocab', level: 'B1', topics: ['home'], es: 'mover', en: 'to move (something)', pos: 'verb', verbId: 'mover' },
  { id: 'v.crecer', kind: 'vocab', level: 'B1', topics: ['storytelling', 'people'], es: 'crecer', en: 'to grow, to grow up', pos: 'verb', verbId: 'crecer' },
  { id: 'v.nacer', kind: 'vocab', level: 'B1', topics: ['introductions', 'past'], es: 'nacer', en: 'to be born', pos: 'verb', verbId: 'nacer' },
  { id: 'v.morir', kind: 'vocab', level: 'B1', topics: ['past', 'people'], es: 'morir', en: 'to die', pos: 'verb', verbId: 'morir' },
  { id: 'v.caer', kind: 'vocab', level: 'B1', topics: ['daily-routine', 'people'], es: 'caer', en: 'to fall', pos: 'verb', verbId: 'caer', note: 'Caer bien / mal is how you say you like or dislike a person.' },
  { id: 'v.ocurrir', kind: 'vocab', level: 'B1', topics: ['storytelling'], es: 'ocurrir', en: 'to happen', pos: 'verb', verbId: 'ocurrir' },

  // --- Verbs: B2 -----------------------------------------------------------
  { id: 'v.suponer', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'suponer', en: 'to suppose, to involve', pos: 'verb', verbId: 'suponer' },
  { id: 'v.mantener', kind: 'vocab', level: 'B2', topics: ['opinions', 'work'], es: 'mantener', en: 'to maintain, to keep', pos: 'verb', verbId: 'mantener' },
  { id: 'v.establecer', kind: 'vocab', level: 'B2', topics: ['work', 'opinions'], es: 'establecer', en: 'to establish, to set', pos: 'verb', verbId: 'establecer' },
  { id: 'v.permitir', kind: 'vocab', level: 'B2', topics: ['opinions', 'city'], es: 'permitir', en: 'to allow', pos: 'verb', verbId: 'permitir' },
  { id: 'v.impedir', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'impedir', en: 'to prevent', pos: 'verb', verbId: 'impedir' },
  { id: 'v.suceder', kind: 'vocab', level: 'B2', topics: ['storytelling'], es: 'suceder', en: 'to happen', pos: 'verb', verbId: 'suceder', note: 'A shade more formal than pasar, a shade less than acontecer.' },
  { id: 'v.resultar', kind: 'vocab', level: 'B2', topics: ['opinions', 'storytelling'], es: 'resultar', en: 'to turn out, to prove', pos: 'verb', verbId: 'resultar', note: 'Resulta que… is how a story delivers its twist.' },

  // --- The city and its services (A2) --------------------------------------
  { id: 'v.pueblo', kind: 'vocab', level: 'A2', topics: ['city', 'travel'], es: 'el pueblo', en: 'village, town', pos: 'noun', gender: 'm', note: 'Also "the people" in the political sense, but for a learner it is the village.' },
  { id: 'v.barrio', kind: 'vocab', level: 'A2', topics: ['city', 'home'], es: 'el barrio', en: 'neighbourhood', pos: 'noun', gender: 'm' },
  { id: 'v.banco', kind: 'vocab', level: 'A2', topics: ['city', 'shopping'], es: 'el banco', en: 'bank, bench', pos: 'noun', gender: 'm', note: 'The same word for both. Context, as usual, decides.' },
  { id: 'v.hospital', kind: 'vocab', level: 'A2', topics: ['city', 'health'], es: 'el hospital', en: 'hospital', pos: 'noun', gender: 'm' },
  { id: 'v.policia', kind: 'vocab', level: 'A2', topics: ['city'], es: 'la policía', en: 'police', pos: 'noun', gender: 'f' },
  { id: 'v.parque', kind: 'vocab', level: 'A2', topics: ['city', 'hobbies'], es: 'el parque', en: 'park', pos: 'noun', gender: 'm' },
  { id: 'v.museo', kind: 'vocab', level: 'A2', topics: ['city', 'travel'], es: 'el museo', en: 'museum', pos: 'noun', gender: 'm' },
  { id: 'v.cine', kind: 'vocab', level: 'A2', topics: ['city', 'hobbies'], es: 'el cine', en: 'cinema', pos: 'noun', gender: 'm' },
  { id: 'v.restaurante', kind: 'vocab', level: 'A2', topics: ['city', 'restaurant'], es: 'el restaurante', en: 'restaurant', pos: 'noun', gender: 'm' },
  { id: 'v.bar', kind: 'vocab', level: 'A2', topics: ['city', 'cafe'], es: 'el bar', en: 'bar', pos: 'noun', gender: 'm', note: 'In Spain the bar is where you have coffee at eight and a caña at eight — not a nightclub.' },
  { id: 'v.iglesia', kind: 'vocab', level: 'A2', topics: ['city', 'travel'], es: 'la iglesia', en: 'church', pos: 'noun', gender: 'f' },
  { id: 'v.centro', kind: 'vocab', level: 'A2', topics: ['city', 'directions'], es: 'el centro', en: 'centre, town centre', pos: 'noun', gender: 'm' },
  { id: 'v.oficina-correos', kind: 'phrase', level: 'A2', topics: ['city'], es: 'la oficina de correos', en: 'post office', pos: 'noun', gender: 'f' },

  // --- Travel (A2) ---------------------------------------------------------
  { id: 'v.pasaporte', kind: 'vocab', level: 'A2', topics: ['travel'], es: 'el pasaporte', en: 'passport', pos: 'noun', gender: 'm' },
  { id: 'v.montana', kind: 'vocab', level: 'A2', topics: ['travel', 'weather'], es: 'la montaña', en: 'mountain', pos: 'noun', gender: 'f' },
  { id: 'v.mapa', kind: 'vocab', level: 'A2', topics: ['travel', 'directions'], es: 'el mapa', en: 'map', pos: 'noun', gender: 'm', note: 'Masculine despite the -a, like el problema and el día.' },
  { id: 'v.turista', kind: 'vocab', level: 'A2', topics: ['travel'], es: 'el turista / la turista', en: 'tourist', pos: 'noun', gender: 'mf' },
  { id: 'v.equipaje', kind: 'vocab', level: 'A2', topics: ['travel'], es: 'el equipaje', en: 'luggage', pos: 'noun', gender: 'm' },
  { id: 'v.quedarse', kind: 'vocab', level: 'A2', topics: ['travel', 'plans'], es: 'quedarse', en: 'to stay', pos: 'verb', note: 'Quedar is to arrange to meet; quedarse is to stay put. The pronoun changes the verb.' },

  // --- Feelings (A2) -------------------------------------------------------
  { id: 'v.sorprendido', kind: 'vocab', level: 'A2', topics: ['feelings'], es: 'sorprendido / sorprendida', en: 'surprised', pos: 'adjective' },
  { id: 'v.aburrido', kind: 'vocab', level: 'A2', topics: ['feelings', 'describing'], es: 'aburrido / aburrida', en: 'bored, boring', pos: 'adjective', note: 'Estoy aburrido — I am bored. Soy aburrido — I am boring. The verb decides.' },
  { id: 'v.alegrarse', kind: 'vocab', level: 'A2', topics: ['feelings', 'social'], es: 'alegrarse', en: 'to be glad', pos: 'verb', note: 'Me alegro is the standard reply to good news.' },

  // --- Arranging (A2) ------------------------------------------------------
  { id: 'v.deber', kind: 'vocab', level: 'A2', topics: ['plans', 'opinions'], es: 'deber', en: 'should, to owe', pos: 'verb', note: 'Debo irme — I should go. Deberías is the softer advice form.' },
  { id: 'p.depende', kind: 'phrase', level: 'A2', topics: ['opinions', 'plans'], es: 'depende', en: 'it depends', pos: 'expression' },
  { id: 'p.quizas', kind: 'phrase', level: 'A2', topics: ['plans', 'opinions'], es: 'quizás', en: 'perhaps', pos: 'adverb', note: 'Usually followed by the subjunctive: quizás venga.' },

  // --- Connecting (B1) -----------------------------------------------------
  { id: 'p.en-cuanto', kind: 'phrase', level: 'B1', topics: ['plans', 'storytelling'], es: 'en cuanto', en: 'as soon as', pos: 'conjunction', note: 'Takes the subjunctive for anything not yet real: en cuanto llegue.' },
  { id: 'p.hasta-que', kind: 'phrase', level: 'B1', topics: ['plans', 'storytelling'], es: 'hasta que', en: 'until', pos: 'conjunction' },
  { id: 'p.para-que', kind: 'phrase', level: 'B1', topics: ['opinions', 'plans'], es: 'para que', en: 'so that', pos: 'conjunction', note: 'Always subjunctive: para que lo entiendas.' },
  { id: 'v.depender-de', kind: 'phrase', level: 'B1', topics: ['opinions'], es: 'depender de', en: 'to depend on', pos: 'verb' },

  // --- Argument (B2) -------------------------------------------------------
  { id: 'p.que-yo-sepa', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'que yo sepa', en: 'as far as I know', pos: 'expression', note: 'A fixed subjunctive — it never changes.' },
  { id: 'p.estar-a-punto-de', kind: 'phrase', level: 'B2', topics: ['plans'], es: 'estar a punto de', en: 'to be about to', pos: 'expression' },
  { id: 'p.dar-por-hecho', kind: 'phrase', level: 'B2', topics: ['opinions'], es: 'dar por hecho', en: 'to take for granted', pos: 'expression' },
  { id: 'v.destacar', kind: 'vocab', level: 'B2', topics: ['opinions', 'work'], es: 'destacar', en: 'to highlight, to stand out', pos: 'verb' },
  { id: 'v.desventaja', kind: 'vocab', level: 'B2', topics: ['opinions'], es: 'la desventaja', en: 'disadvantage', pos: 'noun', gender: 'f' },
];
