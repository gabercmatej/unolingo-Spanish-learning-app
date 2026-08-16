import type { VocabConcept } from '@/content/types';

/**
 * C2 vocabulary — expansion by precision, not by rarity.
 *
 * Almost nothing here is obscure. These are words a Spaniard uses weekly, and
 * the reason they belong at C2 is that each one sits a measured distance from a
 * word the learner already has: sostener next to decir, percance next to
 * problema, sobrio next to simple. Knowing which to reach for is the level.
 *
 * The collocations matter as much as the words: Spanish fixes which verb goes
 * with which noun, and getting it wrong is the most audible remaining accent.
 */
export const c2CoreVocab: VocabConcept[] = [
  // --- Decir, con matices --------------------------------------------------
  { id: 'v.afirmar', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'afirmar', en: 'to state / to assert', pos: 'verb', confusableWith: ['v.sostener', 'v.alegar'], note: 'Se dice con seguridad y se asume la responsabilidad.' },
  { id: 'v.sostener', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'sostener', en: 'to maintain (a claim)', pos: 'verb', note: 'Implica que alguien lo pone en duda y aun así lo mantiene.' },
  { id: 'v.alegar', kind: 'vocab', level: 'C2', topics: ['opinions', 'work'], es: 'alegar', en: 'to claim / to plead', pos: 'verb', note: 'Casi siempre suena a excusa: alegó que no le habían avisado.' },
  { id: 'v.senalar', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'señalar', en: 'to point out', pos: 'verb', note: 'Neutro y muy periodístico: el informe señala que…' },
  { id: 'v.reconocer', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'reconocer', en: 'to admit / to acknowledge', pos: 'verb', note: 'Admitir algo que no favorece a quien lo dice.' },
  { id: 'v.matizar-c2', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'puntualizar', en: 'to clarify a detail', pos: 'verb', note: 'Corrige un detalle sin desmontar el conjunto.' },

  // --- Grados de problema --------------------------------------------------
  { id: 'v.inconveniente', kind: 'vocab', level: 'C2', topics: ['work'], es: 'el inconveniente', en: 'the drawback / the objection', pos: 'noun', gender: 'm', note: 'No hay inconveniente = no objection.' },
  { id: 'v.contratiempo', kind: 'vocab', level: 'C2', topics: ['work'], es: 'el contratiempo', en: 'the hitch / setback', pos: 'noun', gender: 'm', note: 'Suaviza deliberadamente: pasajero y sin culpables.' },
  { id: 'v.percance', kind: 'vocab', level: 'C2', topics: ['travel'], es: 'el percance', en: 'the mishap', pos: 'noun', gender: 'm' },
  { id: 'v.traba', kind: 'vocab', level: 'C2', topics: ['work'], es: 'la traba', en: 'the obstacle (usually bureaucratic)', pos: 'noun', gender: 'f', spainOnly: true, note: 'Trabas burocráticas: la queja española por excelencia.' },
  { id: 'v.chapuza', kind: 'vocab', level: 'C2', topics: ['work', 'slang'], es: 'la chapuza', en: 'the botched job', pos: 'noun', gender: 'f', register: 'colloquial', spainOnly: true },

  // --- Grados de enfado y de opinión ---------------------------------------
  { id: 'v.molesto', kind: 'vocab', level: 'C2', topics: ['feelings'], es: 'molesto / molesta', en: 'annoyed', pos: 'adjective', confusableWith: ['v.indignado'] },
  { id: 'v.indignado', kind: 'vocab', level: 'C2', topics: ['feelings'], es: 'indignado / indignada', en: 'outraged', pos: 'adjective', note: 'Enfado con base moral, no simple irritación.' },
  { id: 'v.escepticismo', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'el escepticismo', en: 'scepticism', pos: 'noun', gender: 'm' },
  { id: 'v.recelo', kind: 'vocab', level: 'C2', topics: ['feelings'], es: 'el recelo', en: 'wariness / mistrust', pos: 'noun', gender: 'm' },
  { id: 'v.sobrio', kind: 'vocab', level: 'C2', topics: ['describing'], es: 'sobrio / sobria', en: 'understated', pos: 'adjective', note: 'Elogio cuando se habla de estilo o diseño, no solo de bebida.' },
  { id: 'v.escueto', kind: 'vocab', level: 'C2', topics: ['describing', 'work'], es: 'escueto / escueta', en: 'terse / to the point', pos: 'adjective', note: 'Puede ser elogio o reproche según el tono.' },
  { id: 'v.contundente', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'contundente', en: 'forceful / conclusive', pos: 'adjective', note: 'Una respuesta contundente, una derrota contundente.' },
  { id: 'v.tibio', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'tibio / tibia', en: 'lukewarm (of a response)', pos: 'adjective', note: 'Figurado: una reacción tibia es casi un insulto.' },

  // --- Colocaciones: qué verbo va con qué sustantivo -----------------------
  { id: 'p.sentar-precedente', kind: 'phrase', level: 'C2', topics: ['work', 'opinions'], es: 'sentar un precedente', en: 'to set a precedent', pos: 'expression' },
  { id: 'p.plantear-una-duda', kind: 'phrase', level: 'C2', topics: ['work'], es: 'plantear una duda', en: 'to raise a doubt', pos: 'expression', note: 'No se "hace" una duda ni se "levanta".' },
  { id: 'p.asumir-un-riesgo', kind: 'phrase', level: 'C2', topics: ['work'], es: 'asumir un riesgo', en: 'to take a risk', pos: 'expression', note: 'tomar un riesgo es calco del inglés.' },
  { id: 'p.entablar-conversacion', kind: 'phrase', level: 'C2', topics: ['social'], es: 'entablar conversación', en: 'to strike up a conversation', pos: 'expression' },
  { id: 'p.despejar-dudas', kind: 'phrase', level: 'C2', topics: ['work'], es: 'despejar dudas', en: 'to clear up doubts', pos: 'expression' },
  { id: 'p.dar-pie-a', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'dar pie a', en: 'to give rise to', pos: 'expression' },
  { id: 'p.poner-de-manifiesto', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'poner de manifiesto', en: 'to highlight / to reveal', pos: 'expression', register: 'formal' },
  { id: 'p.pasar-por-alto', kind: 'phrase', level: 'C2', topics: ['work'], es: 'pasar por alto', en: 'to overlook', pos: 'expression' },
  { id: 'p.dejar-constancia', kind: 'phrase', level: 'C2', topics: ['work'], es: 'dejar constancia de', en: 'to place on record', pos: 'expression', register: 'formal' },
  { id: 'p.tomar-partido', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'tomar partido', en: 'to take sides', pos: 'expression' },
  { id: 'p.ganar-terreno', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'ganar terreno', en: 'to gain ground', pos: 'expression' },
  { id: 'p.salirse-con-la-suya', kind: 'phrase', level: 'C2', topics: ['social'], es: 'salirse con la suya', en: 'to get their own way', pos: 'expression' },

  // --- Sentido figurado ----------------------------------------------------
  { id: 'p.tener-mano-izquierda', kind: 'phrase', level: 'C2', topics: ['work', 'social'], es: 'tener mano izquierda', en: 'to be tactful in handling people', pos: 'expression', spainOnly: true },
  { id: 'p.hacer-oidos-sordos', kind: 'phrase', level: 'C2', topics: ['social'], es: 'hacer oídos sordos', en: 'to turn a deaf ear', pos: 'expression' },
  { id: 'p.ir-al-grano', kind: 'phrase', level: 'C2', topics: ['work'], es: 'ir al grano', en: 'to get to the point', pos: 'expression' },
  { id: 'p.andarse-con-rodeos', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'andarse con rodeos', en: 'to beat about the bush', pos: 'expression' },
  { id: 'p.poner-en-tela-de-juicio', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'poner en tela de juicio', en: 'to call into question', pos: 'expression', register: 'formal' },
  { id: 'p.dar-por-sentado', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'dar por sentado', en: 'to take for granted', pos: 'expression' },
  { id: 'p.sacar-de-quicio', kind: 'phrase', level: 'C2', topics: ['feelings'], es: 'sacar de quicio', en: 'to drive someone up the wall', pos: 'expression', register: 'colloquial' },
  { id: 'p.no-dar-el-brazo', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'no dar el brazo a torcer', en: 'to refuse to back down', pos: 'expression' },

  // --- Reformular cuando no te entienden -----------------------------------
  { id: 'p.a-lo-que-me-refiero', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'a lo que me refiero es a que…', en: 'what I mean is that…', pos: 'expression' },
  { id: 'p.me-explico', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'me explico:', en: 'let me explain:', pos: 'expression', note: 'Se dice antes de reformular, no después.' },
  { id: 'p.no-me-he-explicado', kind: 'phrase', level: 'C2', topics: ['social'], es: 'creo que no me he explicado bien', en: 'I don’t think I explained myself well', pos: 'expression', note: 'Asume la culpa del malentendido: mucho más eficaz que insistir.' },
  { id: 'p.lo-que-quiero-decir', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'lo que quiero decir es que…', en: 'the point I’m making is…', pos: 'expression' },
  { id: 'p.dejame-que-lo-diga', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'déjame que lo diga de otra manera', en: 'let me put it another way', pos: 'expression' },
  { id: 'p.no-es-eso', kind: 'phrase', level: 'C2', topics: ['social'], es: 'no es eso, ni mucho menos', en: 'that’s not it at all', pos: 'expression', register: 'colloquial' },

  // --- Argumentar y sintetizar ---------------------------------------------
  { id: 'p.cabe-senalar', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'cabe señalar que…', en: 'it is worth noting that…', pos: 'expression', register: 'formal' },
  { id: 'p.no-cabe-duda', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'no cabe duda de que…', en: 'there is no doubt that…', pos: 'expression' },
  { id: 'p.a-todas-luces', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'a todas luces', en: 'clearly / by any measure', pos: 'expression', register: 'formal' },
  { id: 'p.en-ultima-instancia', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'en última instancia', en: 'ultimately', pos: 'expression', register: 'formal' },
  { id: 'p.lejos-de', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'lejos de…', en: 'far from…', pos: 'expression', note: 'Lejos de resolverlo, lo empeoró.' },
  { id: 'p.no-tanto-como', kind: 'phrase', level: 'C2', topics: ['opinions'], es: 'no tanto… como…', en: 'not so much… as…', pos: 'expression', note: 'El recurso más limpio para corregir una caracterización.' },
  { id: 'v.sintesis', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'la síntesis', en: 'the synthesis / summary', pos: 'noun', gender: 'f' },
  { id: 'v.salvedad', kind: 'vocab', level: 'C2', topics: ['opinions'], es: 'la salvedad', en: 'the caveat', pos: 'noun', gender: 'f', note: 'Con la salvedad de que… — el matiz que salva el argumento.' },
];
