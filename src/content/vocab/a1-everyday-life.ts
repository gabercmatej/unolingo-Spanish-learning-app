import type { VocabConcept } from '@/content/types';

/**
 * The everyday nouns and verbs an A1 learner reaches for and the course did not
 * have.
 *
 * Written against the coverage audit rather than by intuition. Before this
 * file, `audit:content` reported A1 "Home and rooms" at 5 of 19 slots — the
 * course could say *house* and *flat* and had no word for kitchen, bedroom,
 * bathroom, door, window, chair or bed. Body parts sat at 15 of 26 with no
 * word for arm, leg, knee, mouth or teeth. Those are not depth problems; they
 * are a learner standing in a room unable to name anything in it.
 *
 * Peninsular throughout: `el móvil`, `el ordenador`, `coger`, `la nevera`,
 * `el jersey`, `las gafas`. Where the Latin-American word differs and the
 * learner will meet it, it goes in `regional` rather than becoming an
 * alternative answer.
 */
export const a1EverydayVocab: VocabConcept[] = [
  // --- The body ------------------------------------------------------------
  { id: 'v.cara', kind: 'vocab', level: 'A1', topics: ['health', 'describing'], es: 'la cara', en: 'face', pos: 'noun', gender: 'f' },
  { id: 'v.oreja', kind: 'vocab', level: 'A1', topics: ['health'], es: 'la oreja', en: 'ear', pos: 'noun', gender: 'f', plural: 'las orejas', note: 'La oreja is the outer ear you can see; el oído is the ear you hear with — me duele el oído.' },
  { id: 'v.oido', kind: 'vocab', level: 'A1', topics: ['health'], es: 'el oído', en: 'ear (hearing)', pos: 'noun', gender: 'm' },
  { id: 'v.nariz', kind: 'vocab', level: 'A1', topics: ['health', 'describing'], es: 'la nariz', en: 'nose', pos: 'noun', gender: 'f' },
  { id: 'v.boca', kind: 'vocab', level: 'A1', topics: ['health'], es: 'la boca', en: 'mouth', pos: 'noun', gender: 'f' },
  { id: 'v.diente', kind: 'vocab', level: 'A1', topics: ['health'], es: 'el diente', en: 'tooth', pos: 'noun', gender: 'm', plural: 'los dientes' },
  { id: 'v.cuello', kind: 'vocab', level: 'A1', topics: ['health'], es: 'el cuello', en: 'neck', pos: 'noun', gender: 'm' },
  { id: 'v.hombro', kind: 'vocab', level: 'A1', topics: ['health'], es: 'el hombro', en: 'shoulder', pos: 'noun', gender: 'm', plural: 'los hombros' },
  { id: 'v.pecho', kind: 'vocab', level: 'A1', topics: ['health'], es: 'el pecho', en: 'chest', pos: 'noun', gender: 'm' },
  { id: 'v.brazo', kind: 'vocab', level: 'A1', topics: ['health'], es: 'el brazo', en: 'arm', pos: 'noun', gender: 'm', plural: 'los brazos' },
  { id: 'v.dedo', kind: 'vocab', level: 'A1', topics: ['health'], es: 'el dedo', en: 'finger', pos: 'noun', gender: 'm', plural: 'los dedos', note: 'Also the toe — el dedo del pie. Spanish does not give them separate words.' },
  { id: 'v.pierna', kind: 'vocab', level: 'A1', topics: ['health'], es: 'la pierna', en: 'leg', pos: 'noun', gender: 'f', plural: 'las piernas' },
  { id: 'v.rodilla', kind: 'vocab', level: 'A1', topics: ['health'], es: 'la rodilla', en: 'knee', pos: 'noun', gender: 'f', plural: 'las rodillas' },
  { id: 'v.cuerpo', kind: 'vocab', level: 'A1', topics: ['health'], es: 'el cuerpo', en: 'body', pos: 'noun', gender: 'm' },
  { id: 'v.doler', kind: 'vocab', level: 'A1', topics: ['health'], es: 'doler', en: 'to hurt', pos: 'verb', verbId: 'doler', note: 'Works like gustar: the body part is the subject. Me duele la cabeza — my head hurts me.' },

  // --- Home and rooms ------------------------------------------------------
  { id: 'v.habitacion', kind: 'vocab', level: 'A1', topics: ['home', 'travel'], es: 'la habitación', en: 'room', pos: 'noun', gender: 'f', note: 'Also the hotel room, and in a house usually the bedroom.' },
  { id: 'v.cocina', kind: 'vocab', level: 'A1', topics: ['home'], es: 'la cocina', en: 'kitchen', pos: 'noun', gender: 'f', note: 'Also the cooker, and the verb cocinar comes straight off it.' },
  { id: 'v.salon', kind: 'vocab', level: 'A1', topics: ['home'], es: 'el salón', en: 'living room', pos: 'noun', gender: 'm', spainOnly: true, regional: { spain: 'el salón', latam: 'la sala', note: 'Both are understood everywhere; el salón is what you will hear in Spain.' } },
  { id: 'v.dormitorio', kind: 'vocab', level: 'A1', topics: ['home'], es: 'el dormitorio', en: 'bedroom', pos: 'noun', gender: 'm' },
  { id: 'v.bano', kind: 'vocab', level: 'A1', topics: ['home', 'city'], es: 'el baño', en: 'bathroom', pos: 'noun', gender: 'm', note: '¿Dónde está el baño? is the one you will need first.' },
  { id: 'v.puerta', kind: 'vocab', level: 'A1', topics: ['home'], es: 'la puerta', en: 'door', pos: 'noun', gender: 'f' },
  { id: 'v.ventana', kind: 'vocab', level: 'A1', topics: ['home'], es: 'la ventana', en: 'window', pos: 'noun', gender: 'f' },
  { id: 'v.silla', kind: 'vocab', level: 'A1', topics: ['home'], es: 'la silla', en: 'chair', pos: 'noun', gender: 'f' },
  { id: 'v.cama', kind: 'vocab', level: 'A1', topics: ['home'], es: 'la cama', en: 'bed', pos: 'noun', gender: 'f' },
  { id: 'v.sofa', kind: 'vocab', level: 'A1', topics: ['home'], es: 'el sofá', en: 'sofa', pos: 'noun', gender: 'm', note: 'Masculine despite the -a: el sofá.' },
  { id: 'v.nevera', kind: 'vocab', level: 'A1', topics: ['home', 'food'], es: 'la nevera', en: 'fridge', pos: 'noun', gender: 'f', spainOnly: true, regional: { spain: 'la nevera', latam: 'el refrigerador', note: 'El frigorífico also works in Spain; la nevera is the everyday word.' } },
  { id: 'v.ducha', kind: 'vocab', level: 'A1', topics: ['home', 'daily-routine'], es: 'la ducha', en: 'shower', pos: 'noun', gender: 'f' },
  { id: 'v.jardin', kind: 'vocab', level: 'A1', topics: ['home'], es: 'el jardín', en: 'garden', pos: 'noun', gender: 'm' },
  { id: 'v.luz', kind: 'vocab', level: 'A1', topics: ['home'], es: 'la luz', en: 'light', pos: 'noun', gender: 'f', plural: 'las luces' },
  { id: 'v.pared', kind: 'vocab', level: 'A1', topics: ['home'], es: 'la pared', en: 'wall', pos: 'noun', gender: 'f' },
  { id: 'v.suelo', kind: 'vocab', level: 'A1', topics: ['home'], es: 'el suelo', en: 'floor, ground', pos: 'noun', gender: 'm' },

  // --- Clothes -------------------------------------------------------------
  { id: 'v.falda', kind: 'vocab', level: 'A1', topics: ['shopping', 'describing'], es: 'la falda', en: 'skirt', pos: 'noun', gender: 'f' },
  { id: 'v.jersey', kind: 'vocab', level: 'A1', topics: ['shopping', 'describing'], es: 'el jersey', en: 'jumper', pos: 'noun', gender: 'm', spainOnly: true, regional: { spain: 'el jersey', latam: 'el suéter', note: 'Plural is jerséis.' } },
  { id: 'v.abrigo', kind: 'vocab', level: 'A1', topics: ['shopping', 'weather'], es: 'el abrigo', en: 'coat', pos: 'noun', gender: 'm' },
  { id: 'v.calcetines', kind: 'vocab', level: 'A1', topics: ['shopping'], es: 'los calcetines', en: 'socks', pos: 'noun', gender: 'm' },
  { id: 'v.gorra', kind: 'vocab', level: 'A1', topics: ['shopping'], es: 'la gorra', en: 'cap', pos: 'noun', gender: 'f' },
  { id: 'v.bufanda', kind: 'vocab', level: 'A1', topics: ['shopping', 'weather'], es: 'la bufanda', en: 'scarf', pos: 'noun', gender: 'f' },
  { id: 'v.gafas', kind: 'vocab', level: 'A1', topics: ['shopping', 'describing'], es: 'las gafas', en: 'glasses', pos: 'noun', gender: 'f', note: 'Always plural, like in English. Las gafas de sol are sunglasses.' },
  { id: 'v.bolso', kind: 'vocab', level: 'A1', topics: ['shopping'], es: 'el bolso', en: 'bag, handbag', pos: 'noun', gender: 'm' },

  // --- Food and drink ------------------------------------------------------
  { id: 'v.te', kind: 'vocab', level: 'A1', topics: ['food', 'cafe'], es: 'el té', en: 'tea', pos: 'noun', gender: 'm', note: 'The accent is what separates el té (tea) from te (you, object pronoun).' },
  { id: 'v.manzana', kind: 'vocab', level: 'A1', topics: ['food'], es: 'la manzana', en: 'apple', pos: 'noun', gender: 'f' },
  { id: 'v.naranja', kind: 'vocab', level: 'A1', topics: ['food', 'describing'], es: 'la naranja', en: 'orange', pos: 'noun', gender: 'f', note: 'Also the colour, and as a colour it does not change: dos camisetas naranja.' },
  { id: 'v.platano', kind: 'vocab', level: 'A1', topics: ['food'], es: 'el plátano', en: 'banana', pos: 'noun', gender: 'm', spainOnly: true, regional: { spain: 'el plátano', latam: 'la banana' } },
  { id: 'v.patata', kind: 'vocab', level: 'A1', topics: ['food'], es: 'la patata', en: 'potato', pos: 'noun', gender: 'f', spainOnly: true, regional: { spain: 'la patata', latam: 'la papa', note: 'Patatas bravas are named with the Spanish word for a reason.' } },
  { id: 'v.tomate', kind: 'vocab', level: 'A1', topics: ['food'], es: 'el tomate', en: 'tomato', pos: 'noun', gender: 'm' },
  { id: 'v.sopa', kind: 'vocab', level: 'A1', topics: ['food', 'restaurant'], es: 'la sopa', en: 'soup', pos: 'noun', gender: 'f' },
  { id: 'v.ensalada', kind: 'vocab', level: 'A1', topics: ['food', 'restaurant'], es: 'la ensalada', en: 'salad', pos: 'noun', gender: 'f' },
  { id: 'v.bocadillo', kind: 'vocab', level: 'A1', topics: ['food', 'cafe'], es: 'el bocadillo', en: 'sandwich (in a baguette)', pos: 'noun', gender: 'm', spainOnly: true, note: 'A bocadillo is made with barra de pan. A sandwich de molde is the sliced-bread one.' },
  { id: 'v.postre', kind: 'vocab', level: 'A1', topics: ['food', 'restaurant'], es: 'el postre', en: 'dessert', pos: 'noun', gender: 'm' },
  { id: 'v.helado', kind: 'vocab', level: 'A1', topics: ['food'], es: 'el helado', en: 'ice cream', pos: 'noun', gender: 'm' },
  { id: 'v.azucar', kind: 'vocab', level: 'A1', topics: ['food', 'cafe'], es: 'el azúcar', en: 'sugar', pos: 'noun', gender: 'm' },
  { id: 'v.sal', kind: 'vocab', level: 'A1', topics: ['food'], es: 'la sal', en: 'salt', pos: 'noun', gender: 'f' },
  { id: 'v.aceite', kind: 'vocab', level: 'A1', topics: ['food'], es: 'el aceite', en: 'oil', pos: 'noun', gender: 'm', note: 'El aceite de oliva is on every table in Spain.' },
  { id: 'v.tengo-sed', kind: 'phrase', level: 'A1', topics: ['food', 'cafe'], es: 'tengo sed', en: "I'm thirsty", pos: 'expression', note: 'Thirst is something you have, like hunger and age.' },
  { id: 'v.plato', kind: 'vocab', level: 'A1', topics: ['food', 'restaurant'], es: 'el plato', en: 'plate, dish', pos: 'noun', gender: 'm' },
  { id: 'v.vaso', kind: 'vocab', level: 'A1', topics: ['food', 'cafe'], es: 'el vaso', en: 'glass (tumbler)', pos: 'noun', gender: 'm' },

  // --- Directions and position --------------------------------------------
  { id: 'v.arriba', kind: 'vocab', level: 'A1', topics: ['directions', 'home'], es: 'arriba', en: 'up, upstairs', pos: 'adverb' },
  { id: 'v.abajo', kind: 'vocab', level: 'A1', topics: ['directions', 'home'], es: 'abajo', en: 'down, downstairs', pos: 'adverb' },
  { id: 'v.encima-de', kind: 'phrase', level: 'A1', topics: ['directions', 'home'], es: 'encima de', en: 'on top of, above', pos: 'preposition' },
  { id: 'v.debajo-de', kind: 'phrase', level: 'A1', topics: ['directions', 'home'], es: 'debajo de', en: 'under, below', pos: 'preposition' },
  { id: 'v.detras-de', kind: 'phrase', level: 'A1', topics: ['directions'], es: 'detrás de', en: 'behind', pos: 'preposition' },
  { id: 'v.entre', kind: 'vocab', level: 'A1', topics: ['directions'], es: 'entre', en: 'between, among', pos: 'preposition' },
  { id: 'v.dentro-de', kind: 'phrase', level: 'A1', topics: ['directions', 'home'], es: 'dentro de', en: 'inside', pos: 'preposition' },
  { id: 'v.fuera-de', kind: 'phrase', level: 'A1', topics: ['directions', 'home'], es: 'fuera de', en: 'outside', pos: 'preposition' },
  { id: 'v.sobre', kind: 'vocab', level: 'A1', topics: ['directions'], es: 'sobre', en: 'on, about', pos: 'preposition', note: 'Position on a surface, and also the topic of something: un libro sobre España.' },

  // --- Transport -----------------------------------------------------------
  { id: 'v.taxi', kind: 'vocab', level: 'A1', topics: ['transport', 'city'], es: 'el taxi', en: 'taxi', pos: 'noun', gender: 'm' },
  { id: 'v.bici', kind: 'vocab', level: 'A1', topics: ['transport', 'hobbies'], es: 'la bici', en: 'bike', pos: 'noun', gender: 'f', note: 'Short for la bicicleta, and far more common in speech.' },
  { id: 'v.avion', kind: 'vocab', level: 'A1', topics: ['transport', 'travel'], es: 'el avión', en: 'plane', pos: 'noun', gender: 'm' },
  { id: 'v.aeropuerto', kind: 'vocab', level: 'A1', topics: ['transport', 'travel'], es: 'el aeropuerto', en: 'airport', pos: 'noun', gender: 'm' },

  // --- Time ----------------------------------------------------------------
  { id: 'v.minuto', kind: 'vocab', level: 'A1', topics: ['time'], es: 'el minuto', en: 'minute', pos: 'noun', gender: 'm' },
  { id: 'v.temprano', kind: 'vocab', level: 'A1', topics: ['time', 'daily-routine'], es: 'temprano', en: 'early', pos: 'adverb' },

  // --- People --------------------------------------------------------------
  { id: 'v.padres', kind: 'vocab', level: 'A1', topics: ['family', 'people'], es: 'los padres', en: 'parents', pos: 'noun', gender: 'm', note: 'The masculine plural covers both: los padres is mother and father.' },
  { id: 'v.primo', kind: 'vocab', level: 'A1', topics: ['family'], es: 'el primo / la prima', en: 'cousin', pos: 'noun', gender: 'mf' },
  { id: 'v.marido', kind: 'vocab', level: 'A1', topics: ['family', 'people'], es: 'el marido / la mujer', en: 'husband / wife', pos: 'noun', gender: 'mf', note: 'La mujer is both "woman" and "wife"; context does the work.' },
  { id: 'v.vecino', kind: 'vocab', level: 'A1', topics: ['people', 'home'], es: 'el vecino / la vecina', en: 'neighbour', pos: 'noun', gender: 'mf' },
  { id: 'v.nino', kind: 'vocab', level: 'A1', topics: ['people', 'family'], es: 'el niño / la niña', en: 'child', pos: 'noun', gender: 'mf' },
  { id: 'v.hombre', kind: 'vocab', level: 'A1', topics: ['people'], es: 'el hombre', en: 'man', pos: 'noun', gender: 'm' },
  { id: 'v.mujer', kind: 'vocab', level: 'A1', topics: ['people'], es: 'la mujer', en: 'woman', pos: 'noun', gender: 'f' },
  { id: 'v.nombre', kind: 'vocab', level: 'A1', topics: ['introductions', 'people'], es: 'el nombre', en: 'name', pos: 'noun', gender: 'm' },

  // --- Shopping and money --------------------------------------------------
  { id: 'v.mercado', kind: 'vocab', level: 'A1', topics: ['shopping', 'city'], es: 'el mercado', en: 'market', pos: 'noun', gender: 'm' },
  { id: 'v.precio', kind: 'vocab', level: 'A1', topics: ['shopping'], es: 'el precio', en: 'price', pos: 'noun', gender: 'm' },
  { id: 'v.euro', kind: 'vocab', level: 'A1', topics: ['shopping', 'numbers'], es: 'el euro', en: 'euro', pos: 'noun', gender: 'm' },
  { id: 'v.tarjeta', kind: 'vocab', level: 'A1', topics: ['shopping'], es: 'la tarjeta', en: 'card', pos: 'noun', gender: 'f', note: '¿Se puede pagar con tarjeta? — the question that decides the transaction.' },
  { id: 'v.efectivo', kind: 'vocab', level: 'A1', topics: ['shopping'], es: 'el efectivo', en: 'cash', pos: 'noun', gender: 'm', note: 'En efectivo — in cash.' },
  { id: 'v.ticket', kind: 'vocab', level: 'A1', topics: ['shopping'], es: 'el ticket', en: 'receipt', pos: 'noun', gender: 'm', spainOnly: true, note: 'Pronounced "tíquet". El recibo is the more formal word.' },

  // --- Weather -------------------------------------------------------------
  { id: 'v.nieva', kind: 'phrase', level: 'A1', topics: ['weather'], es: 'nieva', en: "it's snowing", pos: 'expression', note: 'From nevar. Like llover, it only ever appears in the third person.' },
  { id: 'v.nieve', kind: 'vocab', level: 'A1', topics: ['weather'], es: 'la nieve', en: 'snow', pos: 'noun', gender: 'f' },
  { id: 'v.lluvia', kind: 'vocab', level: 'A1', topics: ['weather'], es: 'la lluvia', en: 'rain', pos: 'noun', gender: 'f' },
  { id: 'v.nublado', kind: 'vocab', level: 'A1', topics: ['weather'], es: 'nublado', en: 'cloudy', pos: 'adjective', note: 'Está nublado — the weather is a state here, so estar rather than hacer.' },
  { id: 'v.tormenta', kind: 'vocab', level: 'A1', topics: ['weather'], es: 'la tormenta', en: 'storm', pos: 'noun', gender: 'f' },
  { id: 'v.grado', kind: 'vocab', level: 'A1', topics: ['weather', 'numbers'], es: 'el grado', en: 'degree', pos: 'noun', gender: 'm', plural: 'los grados', note: 'Estamos a treinta grados — Spain talks about the temperature with estar a.' },
  { id: 'v.buen-tiempo', kind: 'phrase', level: 'A1', topics: ['weather'], es: 'hace buen tiempo', en: 'the weather is good', pos: 'expression' },
  { id: 'v.mal-tiempo', kind: 'phrase', level: 'A1', topics: ['weather'], es: 'hace mal tiempo', en: 'the weather is bad', pos: 'expression' },

  // --- Everyday actions ----------------------------------------------------
  { id: 'v.abrir', kind: 'vocab', level: 'A1', topics: ['daily-routine'], es: 'abrir', en: 'to open', pos: 'verb', verbId: 'abrir' },
  { id: 'v.cerrar', kind: 'vocab', level: 'A1', topics: ['daily-routine'], es: 'cerrar', en: 'to close', pos: 'verb', verbId: 'cerrar', note: 'e → ie: cierro, cierras, cierra.' },
  { id: 'v.ayudar', kind: 'vocab', level: 'A1', topics: ['daily-routine', 'social'], es: 'ayudar', en: 'to help', pos: 'verb', verbId: 'ayudar' },
  { id: 'v.esperar', kind: 'vocab', level: 'A1', topics: ['daily-routine'], es: 'esperar', en: 'to wait, to hope', pos: 'verb', verbId: 'esperar', note: 'Both meanings, and Spanish does not mind: Espero el autobús / Espero que sí.' },
  { id: 'v.buscar', kind: 'vocab', level: 'A1', topics: ['daily-routine'], es: 'buscar', en: 'to look for', pos: 'verb', verbId: 'buscar', note: 'No preposition — buscar already means "look for". Busco las llaves.' },
  { id: 'v.encontrar', kind: 'vocab', level: 'A1', topics: ['daily-routine'], es: 'encontrar', en: 'to find', pos: 'verb', verbId: 'encontrar', note: 'o → ue: encuentro, encuentras, encuentra.' },
  { id: 'v.llegar', kind: 'vocab', level: 'A1', topics: ['daily-routine', 'transport'], es: 'llegar', en: 'to arrive', pos: 'verb', verbId: 'llegar' },
  { id: 'v.dormir', kind: 'vocab', level: 'A1', topics: ['daily-routine'], es: 'dormir', en: 'to sleep', pos: 'verb', verbId: 'dormir', note: 'o → ue: duermo, duermes, duerme.' },
  { id: 'v.pasar', kind: 'vocab', level: 'A1', topics: ['daily-routine', 'social'], es: 'pasar', en: 'to happen, to spend (time)', pos: 'verb', verbId: 'pasar', note: '¿Qué pasa? is "what\u2019s up?"; ¿Qué te pasa? is "what\u2019s wrong?".' },
  { id: 'v.dejar', kind: 'vocab', level: 'A1', topics: ['daily-routine'], es: 'dejar', en: 'to leave (behind), to let', pos: 'verb', verbId: 'dejar', note: 'Dejar de + infinitivo is how Spanish says "stop doing": he dejado de fumar.' },
  { id: 'v.necesitar', kind: 'vocab', level: 'A1', topics: ['daily-routine'], es: 'necesitar', en: 'to need', pos: 'verb', verbId: 'necesitar' },
  { id: 'v.empezar', kind: 'vocab', level: 'A1', topics: ['daily-routine', 'time'], es: 'empezar', en: 'to start', pos: 'verb', verbId: 'empezar', note: 'e → ie, and it takes a before an infinitive: empiezo a trabajar.' },
  { id: 'v.terminar', kind: 'vocab', level: 'A1', topics: ['daily-routine', 'time'], es: 'terminar', en: 'to finish', pos: 'verb', verbId: 'terminar' },

  // --- Common adjectives ---------------------------------------------------
  { id: 'v.malo', kind: 'vocab', level: 'A1', topics: ['describing'], es: 'malo / mala', en: 'bad', pos: 'adjective', note: 'Shortens to mal the same way: un mal día.' },
  { id: 'v.nuevo', kind: 'vocab', level: 'A1', topics: ['describing'], es: 'nuevo / nueva', en: 'new', pos: 'adjective' },
  { id: 'v.viejo', kind: 'vocab', level: 'A1', topics: ['describing'], es: 'viejo / vieja', en: 'old', pos: 'adjective', note: 'For people, mayor is kinder than viejo.' },
  { id: 'v.caliente', kind: 'vocab', level: 'A1', topics: ['describing', 'food'], es: 'caliente', en: 'hot', pos: 'adjective', note: 'For things, never for weather — the weather uses hace calor.' },
  { id: 'v.frio-adj', kind: 'vocab', level: 'A1', topics: ['describing', 'food'], es: 'frío / fría', en: 'cold', pos: 'adjective' },
  { id: 'v.largo', kind: 'vocab', level: 'A1', topics: ['describing'], es: 'largo / larga', en: 'long', pos: 'adjective', note: 'A false friend: largo is long, not large.' },
  { id: 'v.corto', kind: 'vocab', level: 'A1', topics: ['describing'], es: 'corto / corta', en: 'short (length)', pos: 'adjective' },
  { id: 'v.limpio', kind: 'vocab', level: 'A1', topics: ['describing', 'home'], es: 'limpio / limpia', en: 'clean', pos: 'adjective' },
  { id: 'v.sucio', kind: 'vocab', level: 'A1', topics: ['describing', 'home'], es: 'sucio / sucia', en: 'dirty', pos: 'adjective' },

  // --- School and work -----------------------------------------------------
  { id: 'v.oficina', kind: 'vocab', level: 'A1', topics: ['work', 'city'], es: 'la oficina', en: 'office', pos: 'noun', gender: 'f' },
  { id: 'v.colegio', kind: 'vocab', level: 'A1', topics: ['university', 'city'], es: 'el colegio', en: 'school', pos: 'noun', gender: 'm', spainOnly: true, note: 'El colegio is school up to about 12; el instituto is secondary school.' },
  { id: 'v.profesor', kind: 'vocab', level: 'A1', topics: ['university', 'work'], es: 'el profesor / la profesora', en: 'teacher', pos: 'noun', gender: 'mf' },
  { id: 'v.estudiante', kind: 'vocab', level: 'A1', topics: ['university'], es: 'el estudiante / la estudiante', en: 'student', pos: 'noun', gender: 'mf' },
  { id: 'v.correo', kind: 'vocab', level: 'A1', topics: ['work'], es: 'el correo', en: 'email, post', pos: 'noun', gender: 'm', note: 'El correo electrónico in full, but nobody says the second word.' },
  { id: 'v.examen', kind: 'vocab', level: 'A1', topics: ['university'], es: 'el examen', en: 'exam', pos: 'noun', gender: 'm', plural: 'los exámenes' },

  { id: 'p.hay', kind: 'phrase', level: 'A1', topics: ['city', 'directions'], es: 'hay', en: 'there is, there are', pos: 'verb', note: 'One word for both, and it never changes: hay un bar, hay tres bares. The grammar of choosing it over está is g.hay-estar.' },

  // --- Survival ------------------------------------------------------------
  { id: 'p.socorro', kind: 'phrase', level: 'A1', topics: ['social', 'health'], es: '¡Socorro!', en: 'Help!', pos: 'interjection', note: 'The emergency shout. Ayuda is the everyday word for help.' },
  { id: 'p.donde-esta-bano', kind: 'phrase', level: 'A1', topics: ['directions', 'city'], es: '¿Dónde está el baño?', en: 'Where is the toilet?', pos: 'expression' },
  { id: 'p.se-puede-pagar-tarjeta', kind: 'phrase', level: 'A1', topics: ['shopping'], es: '¿Se puede pagar con tarjeta?', en: 'Can I pay by card?', pos: 'expression' },
  { id: 'p.como-se-dice', kind: 'phrase', level: 'A1', topics: ['social', 'greetings'], es: '¿Cómo se dice… en español?', en: 'How do you say… in Spanish?', pos: 'expression', note: 'The single most useful question in the language.' },
];
