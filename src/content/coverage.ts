import type { CefrLevel } from '@/content/types';

/**
 * What a learner should be able to *say* by the end of each stage.
 *
 * This file exists because the volume numbers in `audit:content` cannot answer
 * the only question that matters about a curriculum: **could somebody who
 * genuinely mastered this stage function at the level it claims?** "A1 teaches
 * 244 words" is compatible with a learner who can discuss the weather in four
 * ways and cannot name a single part of the body.
 *
 * So coverage is declared as **semantic slots**, not as counts. Each slot is
 * one thing a learner needs to be able to express, and it is satisfied by any
 * one of several acceptable Spanish words. That shape is deliberate in three
 * ways:
 *
 *   1. **It cannot be satisfied by padding.** Adding forty more adjectives does
 *      not fill the "knee" slot. The only way to close a gap is to teach the
 *      thing that is missing.
 *   2. **It is not a quota.** Nothing here says a stage needs N words. A stage
 *      can exceed every slot and still be thin, and the audit's depth notes are
 *      what catch that; a stage can be large and still fail here, which is the
 *      failure this file is for.
 *   3. **It is falsifiable.** Every slot names the words that would satisfy it,
 *      so a disagreement about coverage is a disagreement about a specific
 *      word, not about a number.
 *
 * `by` is the stage the slot must be covered *by the end of*. A slot is
 * satisfied when some concept at or below that level teaches one of its words.
 * Slots deliberately sit at the level where the learner first needs them, not
 * at the level where the word is hardest.
 *
 * Peninsular Spanish throughout: `el móvil`, `el ordenador`, `coger`, `vale`.
 * Latin-American forms are never what satisfies a slot.
 */

export interface CoverageSlot {
  /** What the learner must be able to express. */
  gloss: string;
  /** Any one of these satisfies it. Compared against concept `es`, deaccented. */
  any: string[];
}

export interface CoverageDomain {
  id: string;
  label: string;
  /** The stage this domain must be covered by the end of. */
  by: CefrLevel;
  slots: CoverageSlot[];
}

const slot = (gloss: string, ...any: string[]): CoverageSlot => ({ gloss, any });

export const COVERAGE: CoverageDomain[] = [
  // -------------------------------------------------------------------------
  // A1 — everyday life. If the course claims A1, these are the things a learner
  // will actually reach for on a first trip.
  // -------------------------------------------------------------------------
  {
    id: 'body',
    label: 'Body and basic health',
    by: 'A1',
    slots: [
      slot('head', 'la cabeza'),
      slot('face', 'la cara'),
      slot('hair', 'el pelo'),
      slot('eyes', 'los ojos', 'el ojo'),
      slot('ears', 'las orejas', 'la oreja', 'el oído'),
      slot('nose', 'la nariz'),
      slot('mouth', 'la boca'),
      slot('teeth', 'los dientes', 'el diente'),
      slot('throat', 'la garganta'),
      slot('neck', 'el cuello'),
      slot('shoulders', 'los hombros', 'el hombro'),
      slot('chest', 'el pecho'),
      slot('stomach', 'el estómago', 'la tripa', 'la barriga'),
      slot('back', 'la espalda'),
      slot('arm', 'el brazo', 'los brazos'),
      slot('hand', 'la mano', 'las manos'),
      slot('finger', 'el dedo', 'los dedos'),
      slot('leg', 'la pierna', 'las piernas'),
      slot('knee', 'la rodilla', 'las rodillas'),
      slot('foot', 'el pie', 'los pies'),
      slot('it hurts', 'me duele…', 'me duele', 'doler'),
      slot('I feel ill', 'estoy malo / mala', 'encontrarse mal'),
      slot('doctor', 'el médico / la médica', 'el médico'),
      slot('chemist', 'la farmacia'),
      slot('a temperature', 'la fiebre'),
      slot('a cold', 'el resfriado'),
    ],
  },
  {
    id: 'clothes',
    label: 'Clothes',
    by: 'A1',
    slots: [
      slot('clothes', 'la ropa'),
      slot('t-shirt', 'la camiseta'),
      slot('shirt', 'la camisa'),
      slot('trousers', 'los pantalones'),
      slot('skirt', 'la falda'),
      slot('dress', 'el vestido'),
      slot('jumper', 'el jersey'),
      slot('jacket', 'la chaqueta'),
      slot('coat', 'el abrigo'),
      slot('shoes', 'los zapatos'),
      slot('socks', 'los calcetines'),
      slot('hat / cap', 'la gorra', 'el sombrero'),
      slot('scarf', 'la bufanda'),
      slot('glasses', 'las gafas'),
      slot('bag', 'el bolso', 'la bolsa'),
      slot('to wear', 'llevar'),
      slot('to try on', 'probar / probarse', 'probarse'),
      slot('size', 'la talla'),
    ],
  },
  {
    id: 'food',
    label: 'Food and drink',
    by: 'A1',
    slots: [
      slot('bread', 'el pan'),
      slot('water', 'el agua'),
      slot('milk', 'la leche'),
      slot('coffee', 'el café'),
      slot('tea', 'el té'),
      slot('beer', 'la cerveza'),
      slot('wine', 'el vino'),
      slot('juice', 'el zumo'),
      slot('fruit', 'la fruta'),
      slot('apple', 'la manzana'),
      slot('orange', 'la naranja'),
      slot('vegetables', 'la verdura', 'las verduras'),
      slot('potato', 'la patata', 'las patatas'),
      slot('tomato', 'el tomate'),
      slot('meat', 'la carne'),
      slot('chicken', 'el pollo'),
      slot('fish', 'el pescado'),
      slot('egg', 'el huevo', 'los huevos'),
      slot('cheese', 'el queso'),
      slot('ham', 'el jamón'),
      slot('rice', 'el arroz'),
      slot('soup', 'la sopa'),
      slot('salad', 'la ensalada'),
      slot('sandwich', 'el bocadillo'),
      slot('dessert', 'el postre'),
      slot('ice cream', 'el helado'),
      slot('sugar', 'el azúcar'),
      slot('salt', 'la sal'),
      slot('oil', 'el aceite'),
      slot('breakfast', 'el desayuno'),
      slot('lunch', 'la comida', 'el almuerzo'),
      slot('dinner', 'la cena'),
      slot('to eat', 'comer'),
      slot('to drink', 'beber'),
      slot('to cook', 'cocinar'),
      slot("I'm hungry", 'tengo hambre'),
      slot("I'm thirsty", 'tengo sed'),
    ],
  },
  {
    id: 'home',
    label: 'Home and rooms',
    by: 'A1',
    slots: [
      slot('house', 'la casa'),
      slot('flat', 'el piso'),
      slot('room', 'la habitación'),
      slot('kitchen', 'la cocina'),
      slot('living room', 'el salón'),
      slot('bedroom', 'el dormitorio', 'la habitación'),
      slot('bathroom', 'el baño'),
      slot('door', 'la puerta'),
      slot('window', 'la ventana'),
      slot('table', 'la mesa'),
      slot('chair', 'la silla'),
      slot('bed', 'la cama'),
      slot('sofa', 'el sofá'),
      slot('fridge', 'la nevera'),
      slot('shower', 'la ducha'),
      slot('garden', 'el jardín'),
      slot('key', 'la llave'),
      slot('light', 'la luz'),
      slot('to live', 'vivir'),
    ],
  },
  {
    id: 'directions',
    label: 'Directions and location',
    by: 'A1',
    slots: [
      slot('left', 'la izquierda'),
      slot('right', 'la derecha'),
      slot('straight on', 'todo recto'),
      slot('up / upstairs', 'arriba'),
      slot('down / downstairs', 'abajo'),
      slot('above', 'encima de', 'sobre'),
      slot('below', 'debajo de'),
      slot('behind', 'detrás de'),
      slot('in front of', 'delante de'),
      slot('opposite', 'enfrente de'),
      slot('next to', 'al lado de'),
      slot('between', 'entre'),
      slot('inside', 'dentro de', 'dentro'),
      slot('outside', 'fuera de', 'fuera'),
      slot('near', 'cerca'),
      slot('far', 'lejos'),
      slot('here', 'aquí'),
      slot('there', 'allí'),
      slot('corner', 'la esquina'),
      slot('street', 'la calle'),
      slot('square', 'la plaza'),
      slot('to turn', 'girar'),
      slot('to carry on', 'seguir'),
      slot('where is…?', '¿dónde está…?'),
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    by: 'A1',
    slots: [
      slot('car', 'el coche'),
      slot('bus', 'el autobús'),
      slot('train', 'el tren'),
      slot('metro', 'el metro'),
      slot('taxi', 'el taxi'),
      slot('bike', 'la bici', 'la bicicleta'),
      slot('plane', 'el avión'),
      slot('airport', 'el aeropuerto'),
      slot('station', 'la estación'),
      slot('stop', 'la parada'),
      slot('ticket', 'el billete'),
      slot('to take (transport)', 'coger'),
      slot('to go', 'ir'),
      slot('to drive', 'conducir'),
      slot('on foot', 'andar / ir andando', 'a pie'),
    ],
  },
  {
    id: 'time',
    label: 'Time and dates',
    by: 'A1',
    slots: [
      slot('what time is it?', '¿qué hora es?'),
      slot('hour', 'la hora'),
      slot('minute', 'el minuto'),
      slot('day', 'el día'),
      slot('week', 'la semana'),
      slot('month', 'el mes'),
      slot('year', 'el año'),
      slot('today', 'hoy'),
      slot('tomorrow', 'mañana'),
      slot('yesterday', 'ayer'),
      slot('now', 'ahora'),
      slot('later', 'luego', 'más tarde'),
      slot('early', 'temprano'),
      slot('late', 'tarde'),
      slot('morning', 'la mañana'),
      slot('afternoon', 'la tarde'),
      slot('night', 'la noche'),
      slot('always', 'siempre'),
      slot('never', 'nunca'),
      slot('sometimes', 'a veces'),
      slot('weekend', 'el fin de semana'),
    ],
  },
  {
    id: 'people',
    label: 'Family and people',
    by: 'A1',
    slots: [
      slot('family', 'la familia'),
      slot('mother', 'la madre'),
      slot('father', 'el padre'),
      slot('parents', 'los padres'),
      slot('brother / sister', 'el hermano / la hermana'),
      slot('son / daughter', 'el hijo / la hija'),
      slot('grandparents', 'el abuelo / la abuela'),
      slot('uncle / aunt', 'el tío / la tía'),
      slot('cousin', 'el primo / la prima'),
      slot('husband / wife', 'el marido / la mujer', 'el marido'),
      slot('friend', 'el amigo / la amiga'),
      slot('boyfriend / girlfriend', 'el novio / la novia'),
      slot('neighbour', 'el vecino / la vecina'),
      slot('child', 'el niño / la niña'),
      slot('man / woman', 'el hombre', 'la mujer'),
      slot('people', 'la gente'),
      slot('name', 'el nombre'),
    ],
  },
  {
    id: 'shopping',
    label: 'Shopping and prices',
    by: 'A1',
    slots: [
      slot('shop', 'la tienda'),
      slot('supermarket', 'el supermercado'),
      slot('market', 'el mercado'),
      slot('money', 'el dinero'),
      slot('price', 'el precio'),
      slot('euro', 'el euro'),
      slot('card', 'la tarjeta'),
      slot('cash', 'el efectivo'),
      slot('receipt', 'el ticket', 'el recibo'),
      slot('expensive', 'caro / cara'),
      slot('cheap', 'barato / barata'),
      slot('how much is it?', '¿cuánto cuesta?', '¿cuánto es?'),
      slot('to buy', 'comprar'),
      slot('to pay', 'pagar'),
      slot('a bit / a little', 'un poco'),
    ],
  },
  {
    id: 'weather',
    label: 'Weather',
    by: 'A1',
    slots: [
      slot("what's the weather like?", '¿qué tiempo hace?'),
      slot("it's hot", 'hace calor'),
      slot("it's cold", 'hace frío'),
      slot("it's sunny", 'hace sol'),
      slot("it's windy", 'hace viento'),
      slot("it's raining", 'llueve', 'la lluvia'),
      slot("it's snowing", 'nieva', 'la nieve'),
      slot('cloudy', 'nublado', 'está nublado'),
      slot('storm', 'la tormenta'),
      slot('temperature / degrees', 'el grado', 'los grados', 'la temperatura'),
      slot('good weather', 'hace buen tiempo'),
      slot('bad weather', 'hace mal tiempo'),
    ],
  },
  {
    id: 'everyday-actions',
    label: 'Everyday activities',
    by: 'A1',
    slots: [
      slot('to get up', 'levantarse'),
      slot('to wake up', 'despertarse'),
      slot('to shower', 'ducharse'),
      slot('to go to bed', 'acostarse'),
      slot('to work', 'trabajar'),
      slot('to study', 'estudiar'),
      slot('to read', 'leer'),
      slot('to write', 'escribir'),
      slot('to listen', 'escuchar'),
      slot('to watch', 'ver'),
      slot('to speak', 'hablar'),
      slot('to walk', 'andar / ir andando', 'caminar', 'andar'),
      slot('to buy', 'comprar'),
      slot('to open', 'abrir'),
      slot('to close', 'cerrar'),
      slot('to help', 'ayudar'),
      slot('to wait', 'esperar'),
      slot('to look for', 'buscar'),
      slot('to find', 'encontrar'),
      slot('to give', 'dar'),
      slot('to take / carry', 'llevar'),
      slot('to leave / go out', 'salir'),
      slot('to arrive', 'llegar'),
      slot('to sleep', 'dormir'),
    ],
  },
  {
    id: 'describing',
    label: 'Common adjectives and adverbs',
    by: 'A1',
    slots: [
      slot('big', 'grande'),
      slot('small', 'pequeño / pequeña'),
      slot('good', 'bueno / buena'),
      slot('bad', 'malo / mala'),
      slot('new', 'nuevo / nueva'),
      slot('old (thing)', 'viejo / vieja', 'antiguo / antigua'),
      slot('young', 'joven'),
      slot('tall', 'alto / alta'),
      slot('short', 'bajo / baja'),
      slot('easy', 'fácil'),
      slot('difficult', 'difícil'),
      slot('nice (person)', 'simpático / simpática'),
      slot('pretty', 'guapo / guapa', 'bonito / bonita'),
      slot('happy', 'contento / contenta'),
      slot('sad', 'triste'),
      slot('tired', 'cansado / cansada'),
      slot('hot (thing)', 'caliente'),
      slot('cold (thing)', 'frío / fría'),
      slot('very', 'muy'),
      slot('a lot', 'mucho'),
      slot('too much', 'demasiado / demasiada'),
      slot('also', 'también'),
      slot('but', 'pero'),
      slot('because', 'porque'),
    ],
  },
  {
    id: 'school-work',
    label: 'School and work basics',
    by: 'A1',
    slots: [
      slot('work / job', 'el trabajo'),
      slot('office', 'la oficina'),
      slot('school', 'el colegio', 'la escuela'),
      slot('university', 'la universidad'),
      slot('class', 'la clase'),
      slot('teacher', 'el profesor / la profesora'),
      slot('student', 'el estudiante / la estudiante', 'el alumno / la alumna'),
      slot('book', 'el libro'),
      slot('computer', 'el ordenador'),
      slot('phone', 'el móvil'),
      slot('email', 'el correo', 'el email'),
      slot('meeting', 'la reunión'),
      slot('timetable', 'el horario'),
      slot('exam', 'el examen'),
    ],
  },
  {
    id: 'survival',
    label: 'Essential chunks',
    by: 'A1',
    slots: [
      slot('hello', 'hola'),
      slot('goodbye', 'adiós'),
      slot('please', 'por favor'),
      slot('thank you', 'gracias'),
      slot('sorry / excuse me', 'perdona', 'lo siento'),
      slot('yes / no', 'sí', 'no'),
      slot("I don't understand", 'no entiendo'),
      slot('can you repeat?', '¿puedes repetir, por favor?'),
      slot('more slowly', 'más despacio, por favor', 'más despacio'),
      slot("what's your name?", '¿cómo te llamas?'),
      slot('my name is', 'me llamo'),
      slot('where are you from?', '¿de dónde eres?'),
      slot('I would like', 'quiero…', 'quisiera…'),
      slot('there is / there are', 'hay'),
      slot('okay', 'vale'),
      slot('how much?', '¿cuánto cuesta?', '¿cuánto es?'),
      slot('help!', 'ayuda', 'socorro'),
    ],
  },

  // -------------------------------------------------------------------------
  // A2 — beyond survival: describing, comparing, arranging, recounting.
  // -------------------------------------------------------------------------
  {
    id: 'travel-a2',
    label: 'Travel and accommodation',
    by: 'A2',
    slots: [
      slot('trip', 'el viaje'),
      slot('hotel', 'el hotel'),
      slot('room (hotel)', 'la habitación'),
      slot('booking', 'la reserva', 'reservar'),
      slot('suitcase', 'la maleta'),
      slot('passport', 'el pasaporte'),
      slot('beach', 'la playa'),
      slot('mountain', 'la montaña'),
      slot('map', 'el mapa'),
      slot('tourist', 'el turista / la turista', 'turístico / turística'),
      slot('to travel', 'viajar'),
      slot('to stay', 'quedarse', 'alojarse'),
      slot('luggage', 'el equipaje'),
      slot('delay', 'el retraso'),
    ],
  },
  {
    id: 'city-a2',
    label: 'The city and services',
    by: 'A2',
    slots: [
      slot('city', 'la ciudad'),
      slot('town / village', 'el pueblo'),
      slot('neighbourhood', 'el barrio'),
      slot('bank', 'el banco'),
      slot('post office', 'el correo', 'la oficina de correos'),
      slot('hospital', 'el hospital'),
      slot('police', 'la policía'),
      slot('park', 'el parque'),
      slot('museum', 'el museo'),
      slot('cinema', 'el cine'),
      slot('restaurant', 'el restaurante'),
      slot('bar', 'el bar'),
      slot('church', 'la iglesia'),
      slot('centre', 'el centro'),
    ],
  },
  {
    id: 'feelings-a2',
    label: 'Feelings and reactions',
    by: 'A2',
    slots: [
      slot('happy / glad', 'contento / contenta', 'alegre'),
      slot('angry', 'enfadado / enfadada'),
      slot('worried', 'preocupado / preocupada'),
      slot('nervous', 'nervioso / nerviosa'),
      slot('surprised', 'sorprendido / sorprendida'),
      slot('bored', 'aburrido / aburrida'),
      slot('scared', 'me da miedo', 'tener miedo'),
      slot('to feel', 'sentirse', 'sentir'),
      slot('to be pleased', 'alegrarse'),
      slot('what a shame', 'qué pena', 'me da pena'),
    ],
  },
  {
    id: 'arranging-a2',
    label: 'Arranging and negotiating',
    by: 'A2',
    slots: [
      slot('to meet up', 'quedar'),
      slot('to fancy doing', 'me apetece', 'apetecer'),
      slot('to have to', 'tener que + infinitivo'),
      slot('to be able to', 'poder'),
      slot('to prefer', 'preferir'),
      slot('to try to', 'intentar', 'tratar de'),
      slot('to need', 'necesitar'),
      slot('to owe / must', 'deber'),
      slot('maybe', 'quizás', 'a lo mejor', 'igual…'),
      slot('of course', 'claro'),
      slot('it depends', 'depende'),
    ],
  },

  // -------------------------------------------------------------------------
  // B1 — accounts, opinions, hypotheticals. Less about nouns, more about the
  // machinery for connecting them.
  // -------------------------------------------------------------------------
  {
    id: 'discourse-b1',
    label: 'Connecting and structuring',
    by: 'B1',
    slots: [
      slot('however', 'sin embargo'),
      slot('besides', 'además'),
      slot('therefore', 'por eso', 'por lo tanto'),
      slot('although', 'aunque'),
      slot('while', 'mientras'),
      slot('as soon as', 'en cuanto'),
      slot('until', 'hasta que'),
      slot('so that', 'para que'),
      slot('in the end', 'al final'),
      slot('suddenly', 'de repente'),
      slot('then / next', 'entonces', 'luego'),
      slot('on the other hand', 'en cambio', 'por otro lado'),
      slot('actually', 'en realidad', 'la verdad es que…'),
      slot('the thing is', 'lo que pasa es que…'),
    ],
  },
  {
    id: 'opinion-b1',
    label: 'Opinions and recommendations',
    by: 'B1',
    slots: [
      slot('in my opinion', 'en mi opinión', 'desde mi punto de vista'),
      slot('I think that', 'creo que', 'me parece que'),
      slot("I don't agree", 'no estoy de acuerdo', 'no estoy de acuerdo con…'),
      slot('to be right', 'tener razón'),
      slot('to recommend', 'te recomiendo que…', 'recomendar'),
      slot('to complain', 'quejarse'),
      slot('to be worth it', 'merece la pena'),
      slot('to depend on', 'depender de'),
      slot('to realise', 'darse cuenta de'),
      slot('to manage to', 'conseguir', 'lograr'),
    ],
  },
  {
    id: 'life-b1',
    label: 'Work, study and daily life',
    by: 'B1',
    slots: [
      slot('company', 'la empresa'),
      slot('boss', 'el jefe / la jefa'),
      slot('salary', 'el sueldo'),
      slot('colleague', 'el compañero / la compañera'),
      slot('degree course', 'la carrera'),
      slot('subject', 'la asignatura'),
      slot('to pass', 'aprobar'),
      slot('to fail', 'suspender'),
      slot('unemployment', 'el paro'),
      slot('to apply / hand in a CV', 'echar un currículum', 'buscar trabajo'),
      slot('rent', 'el alquiler'),
      slot('bill', 'la factura', 'la cuenta'),
      slot('appointment', 'la cita'),
    ],
  },

  // -------------------------------------------------------------------------
  // B2 — argument, nuance, register. C1/C2 are handled by the depth notes and
  // the drill checks rather than by naming vocabulary, because at those levels
  // the requirement is control rather than coverage.
  // -------------------------------------------------------------------------
  {
    id: 'argument-b2',
    label: 'Argument and hedging',
    by: 'B2',
    slots: [
      slot('to argue / claim', 'alegar', 'sostener', 'plantear'),
      slot('to take into account', 'tener en cuenta'),
      slot('to point out', 'señalar', 'destacar'),
      slot('on the one hand… on the other', 'por un lado… por otro lado'),
      slot('apparently', 'por lo visto'),
      slot('as far as I know', 'que yo sepa'),
      slot('it strikes me as', 'me parece que'),
      slot('to be about to', 'estar a punto de'),
      slot('drawback', 'el inconveniente', 'la desventaja'),
      slot('advantage', 'la ventaja', 'la ventaja es'),
      slot('to assume', 'asumir', 'dar por hecho'),
      slot('to bear in mind', 'hay que tener en cuenta', 'hay que tener en cuenta que…', 'tener en cuenta'),
    ],
  },
];

/**
 * The high-frequency verbs a learner cannot function without.
 *
 * Separate from the domains because a verb is not a slot in a topic — it is
 * machinery, reused everywhere. Ordered by the level at which not knowing it
 * starts to cost the learner a sentence they want to make.
 */
export const CORE_VERBS: { level: CefrLevel; infinitives: string[] }[] = [
  {
    level: 'A1',
    infinitives: [
      'ser', 'estar', 'tener', 'haber', 'hacer', 'ir', 'querer', 'poder',
      'decir', 'ver', 'dar', 'saber', 'llegar', 'pasar', 'hablar', 'comer',
      'vivir', 'trabajar', 'estudiar', 'llamarse', 'gustar', 'necesitar',
    ],
  },
  {
    level: 'A2',
    infinitives: [
      'poner', 'salir', 'venir', 'conocer', 'llevar', 'quedar', 'empezar',
      'volver', 'pensar', 'entender', 'buscar', 'encontrar', 'comprar',
      'pagar', 'abrir', 'cerrar', 'dormir', 'sentir', 'preferir', 'jugar',
      'levantarse', 'ducharse', 'acostarse', 'coger', 'esperar', 'ayudar',
    ],
  },
  {
    level: 'B1',
    infinitives: [
      'seguir', 'contar', 'dejar', 'parecer', 'creer', 'perder', 'ganar',
      'recordar', 'olvidar', 'conseguir', 'intentar', 'ocurrir', 'servir',
      'mover', 'cambiar', 'crecer', 'nacer', 'morir', 'traer', 'caer',
    ],
  },
  {
    level: 'B2',
    infinitives: [
      'suponer', 'lograr', 'exigir', 'plantear', 'asumir', 'señalar',
      'mantener', 'establecer', 'permitir', 'impedir', 'suceder', 'resultar',
    ],
  },
];

/**
 * Grammar a learner has to control to claim a level.
 *
 * Matched loosely against grammar concept titles and ids, because the course's
 * naming is its own and this list should not have to track it word for word. A
 * miss here means "no grammar concept in the course looks like it covers this",
 * which is a question worth a human answering rather than an assertion.
 */
export const CORE_GRAMMAR: { level: CefrLevel; points: { label: string; match: string[] }[] }[] = [
  {
    level: 'A1',
    points: [
      { label: 'ser vs estar', match: ['ser', 'estar'] },
      { label: 'gender and articles', match: ['gender', 'article', 'género', 'artícul'] },
      { label: 'plurals', match: ['plural'] },
      { label: 'noun–adjective agreement', match: ['agreement', 'concordancia', 'adjective'] },
      { label: 'present tense', match: ['present'] },
      { label: 'subject pronouns', match: ['pronoun', 'pronombre'] },
      { label: 'possessives', match: ['possessive', 'posesivo'] },
      { label: 'negation', match: ['negat', 'no '] },
      { label: 'questions', match: ['question', 'interrog', 'pregunt'] },
      { label: 'hay', match: ['hay'] },
      { label: 'gustar', match: ['gustar', 'gusta'] },
      { label: 'tener expressions', match: ['tener'] },
    ],
  },
  {
    level: 'A2',
    points: [
      { label: 'reflexive verbs', match: ['reflex'] },
      { label: 'present perfect', match: ['perfect', 'he '] },
      { label: 'preterite', match: ['preterite', 'pretérito'] },
      { label: 'near future (ir a)', match: ['ir a', 'future', 'futuro'] },
      { label: 'comparatives', match: ['compar', 'más', 'menos'] },
      { label: 'direct object pronouns', match: ['object pronoun', 'lo/la', 'direct'] },
      { label: 'por vs para', match: ['por', 'para'] },
      { label: 'demonstratives', match: ['demonstrat', 'este', 'ese'] },
      { label: 'obligation (tener que / hay que)', match: ['obligation', 'tener que', 'hay que'] },
    ],
  },
  {
    level: 'B1',
    points: [
      { label: 'imperfect', match: ['imperfect', 'imperfecto'] },
      { label: 'preterite vs imperfect', match: ['preterite', 'imperfect'] },
      { label: 'present subjunctive', match: ['subjunctive', 'subjuntivo'] },
      { label: 'imperative / commands', match: ['imperative', 'command', 'imperativo'] },
      { label: 'indirect object pronouns', match: ['indirect', 'le/les', 'object pronoun'] },
      { label: 'future tense', match: ['future', 'futuro'] },
      { label: 'conditional', match: ['conditional', 'condicional'] },
      { label: 'impersonal se', match: ['se ', 'impersonal'] },
      { label: 'pluperfect', match: ['pluperfect', 'pluscuam', 'había'] },
      { label: 'relative clauses', match: ['relative', 'que ', 'relativo'] },
    ],
  },
  {
    level: 'B2',
    points: [
      { label: 'imperfect subjunctive', match: ['imperfect subjunctive', 'subjuntivo', 'subjunctive'] },
      { label: 'si clauses / hypotheticals', match: ['si ', 'hypothet', 'condicional'] },
      { label: 'reported speech', match: ['reported', 'indirect speech', 'estilo indirecto'] },
      { label: 'passive and se passive', match: ['passive', 'pasiva'] },
      { label: 'concessive clauses (aunque)', match: ['aunque', 'concess'] },
      { label: 'perfect subjunctive', match: ['haya', 'perfect subjunctive'] },
    ],
  },
];
