import type { Sentence } from '@/content/types';

/**
 * Sentences for the everyday A1 vocabulary — the body, the house, clothes,
 * food, position, transport, people, money, weather and the verbs that hold
 * them together.
 *
 * Written to be *said*, not to fill a slot. Where a line exists to drill a
 * form it still has to be something a person in Spain would actually come out
 * with, because a corpus of grammatical non-sentences teaches a learner to
 * produce grammatical non-sentences.
 *
 * Kept deliberately short and lexically plain. These are the first sentences a
 * learner meets for each of these words, and `learning/eligibility.ts` counts
 * unknown words before it will let a sentence be used for production — a
 * beautiful line carrying three untaught nouns is a line the course cannot use.
 */
export const a1EverydayLifeSentences: Sentence[] = [
  // --- The body and feeling unwell -----------------------------------------
  { id: 's.g1', es: 'Me duele la cabeza.', en: 'My head hurts.', concepts: ['v.doler', 'v.cabeza', 'f.doler.present'], level: 'A1', topics: ['health'], blanks: ['duele'], note: 'Doler works like gustar: la cabeza is the subject, so it is duele, not duelo.' },
  { id: 's.g2', es: 'Me duelen las piernas.', en: 'My legs hurt.', concepts: ['v.doler', 'v.pierna', 'f.doler.present'], level: 'A1', topics: ['health'], blanks: ['duelen'], note: 'Two legs, so the verb goes plural: duelen.' },
  { id: 's.g3', es: 'Tengo la nariz fría.', en: 'My nose is cold.', concepts: ['v.nariz', 'v.frio-adj'], level: 'A1', topics: ['health'] },
  { id: 's.g4', es: 'Abre la boca, por favor.', en: 'Open your mouth, please.', concepts: ['v.boca', 'v.abrir', 'f.abrir.imperative'], level: 'A1', topics: ['health'] },
  { id: 's.g5', es: 'Me lavo los dientes por la mañana.', en: 'I brush my teeth in the morning.', concepts: ['v.diente'], level: 'A1', topics: ['health', 'daily-routine'], note: 'Spanish says "I wash myself the teeth" — the reflexive replaces the possessive.' },
  { id: 's.g6', es: 'Tiene los ojos verdes y el pelo largo.', en: 'She has green eyes and long hair.', concepts: ['v.largo'], level: 'A1', topics: ['describing'] },
  { id: 's.g7', es: 'Me duele el oído desde ayer.', en: 'My ear has been hurting since yesterday.', concepts: ['v.oido', 'v.doler', 'f.doler.present'], level: 'A1', topics: ['health'] },
  { id: 's.g8', es: 'Tengo las orejas muy grandes.', en: 'I have very big ears.', concepts: ['v.oreja'], level: 'A1', topics: ['health', 'describing'] },
  { id: 's.g9', es: 'Me duele el cuello por el ordenador.', en: 'My neck hurts because of the computer.', concepts: ['v.cuello', 'v.doler', 'f.doler.present'], level: 'A1', topics: ['health'] },
  { id: 's.g10', es: 'Me duelen los hombros después del trabajo.', en: 'My shoulders hurt after work.', concepts: ['v.hombro', 'v.doler'], level: 'A1', topics: ['health', 'work'] },
  { id: 's.g11', es: 'Me duele el pecho cuando corro.', en: 'My chest hurts when I run.', concepts: ['v.pecho', 'v.doler'], level: 'A1', topics: ['health'] },
  { id: 's.g12', es: 'Tengo un brazo roto.', en: 'I have a broken arm.', concepts: ['v.brazo'], level: 'A1', topics: ['health'] },
  { id: 's.g13', es: 'Me he cortado un dedo en la cocina.', en: "I've cut my finger in the kitchen.", concepts: ['v.dedo', 'v.cocina'], level: 'A1', topics: ['health', 'home'] },
  { id: 's.g14', es: 'Me duele la rodilla derecha.', en: 'My right knee hurts.', concepts: ['v.rodilla', 'v.doler'], level: 'A1', topics: ['health'] },
  { id: 's.g15', es: 'Tienes muy buena cara hoy.', en: 'You look really well today.', concepts: ['v.cara'], level: 'A1', topics: ['health', 'social'], note: 'Literally "you have a very good face" — the Spanish way of saying somebody looks healthy.' },
  { id: 's.g16', es: 'Todo el cuerpo me duele.', en: 'My whole body aches.', concepts: ['v.cuerpo', 'v.doler'], level: 'A1', topics: ['health'] },
  { id: 's.g17', es: 'No me encuentro bien.', en: "I don't feel well.", concepts: ['v.encontrar', 'f.encontrar.present'], level: 'A1', topics: ['health'], note: 'Encontrarse is how Spanish asks and answers about how you feel physically.' },
  { id: 's.g18', es: '¿Necesitas ir al médico?', en: 'Do you need to go to the doctor?', concepts: ['v.necesitar', 'f.necesitar.present'], level: 'A1', topics: ['health'] },

  // --- The house -----------------------------------------------------------
  { id: 's.g19', es: 'La cocina es pequeña pero tiene mucha luz.', en: 'The kitchen is small but it gets a lot of light.', concepts: ['v.cocina', 'v.luz'], level: 'A1', topics: ['home'] },
  { id: 's.g20', es: 'El salón está al lado de la cocina.', en: 'The living room is next to the kitchen.', concepts: ['v.salon', 'v.cocina'], level: 'A1', topics: ['home', 'directions'] },
  { id: 's.g21', es: 'Mi dormitorio tiene una ventana grande.', en: 'My bedroom has a big window.', concepts: ['v.dormitorio', 'v.ventana'], level: 'A1', topics: ['home'] },
  { id: 's.g22', es: '¿Dónde está el baño?', en: 'Where is the toilet?', concepts: ['p.donde-esta-bano', 'v.bano'], level: 'A1', topics: ['home', 'city', 'directions'] },
  { id: 's.g23', es: 'Cierra la puerta, por favor.', en: 'Close the door, please.', concepts: ['v.puerta', 'v.cerrar', 'f.cerrar.imperative'], level: 'A1', topics: ['home'] },
  { id: 's.g24', es: '¿Puedes abrir la ventana?', en: 'Can you open the window?', concepts: ['v.ventana', 'v.abrir'], level: 'A1', topics: ['home'] },
  { id: 's.g25', es: 'Hay cuatro sillas alrededor de la mesa.', en: 'There are four chairs around the table.', concepts: ['v.silla'], level: 'A1', topics: ['home'] },
  { id: 's.g26', es: 'La cama es muy cómoda.', en: 'The bed is very comfortable.', concepts: ['v.cama'], level: 'A1', topics: ['home'] },
  { id: 's.g27', es: 'El gato duerme en el sofá.', en: 'The cat sleeps on the sofa.', concepts: ['v.sofa', 'v.dormir', 'f.dormir.present'], level: 'A1', topics: ['home'] },
  { id: 's.g28', es: 'La leche está en la nevera.', en: 'The milk is in the fridge.', concepts: ['v.nevera'], level: 'A1', topics: ['home', 'food'] },
  { id: 's.g29', es: 'Me ducho antes de desayunar.', en: 'I shower before having breakfast.', concepts: ['v.ducha'], level: 'A1', topics: ['home', 'daily-routine'] },
  { id: 's.g30', es: 'Tenemos un jardín pequeño detrás de la casa.', en: 'We have a small garden behind the house.', concepts: ['v.jardin', 'v.detras-de'], level: 'A1', topics: ['home', 'directions'] },
  { id: 's.g31', es: 'Apaga la luz, por favor.', en: 'Turn off the light, please.', concepts: ['v.luz'], level: 'A1', topics: ['home'] },
  { id: 's.g32', es: 'Hay un cuadro en la pared del salón.', en: "There's a picture on the living-room wall.", concepts: ['v.pared', 'v.salon'], level: 'A1', topics: ['home'] },
  { id: 's.g33', es: 'El suelo de la cocina está muy limpio.', en: 'The kitchen floor is very clean.', concepts: ['v.suelo', 'v.limpio', 'v.cocina'], level: 'A1', topics: ['home', 'describing'] },
  { id: 's.g34', es: 'Mi habitación está arriba.', en: 'My room is upstairs.', concepts: ['v.habitacion', 'v.arriba'], level: 'A1', topics: ['home', 'directions'] },
  { id: 's.g35', es: 'La cocina y el baño están abajo.', en: 'The kitchen and the bathroom are downstairs.', concepts: ['v.abajo', 'v.cocina', 'v.bano'], level: 'A1', topics: ['home', 'directions'] },
  { id: 's.g36', es: 'El piso está sucio, hay que limpiarlo.', en: 'The flat is dirty, it needs cleaning.', concepts: ['v.sucio'], level: 'A1', topics: ['home', 'describing'] },

  // --- Position ------------------------------------------------------------
  { id: 's.g37', es: 'Las llaves están encima de la mesa.', en: 'The keys are on the table.', concepts: ['v.encima-de'], level: 'A1', topics: ['home', 'directions'], blanks: ['encima'] },
  { id: 's.g38', es: 'El perro está debajo de la cama.', en: 'The dog is under the bed.', concepts: ['v.debajo-de', 'v.cama'], level: 'A1', topics: ['home', 'directions'], blanks: ['debajo'] },
  { id: 's.g39', es: 'La farmacia está detrás de la iglesia.', en: 'The chemist is behind the church.', concepts: ['v.detras-de'], level: 'A1', topics: ['directions', 'city'] },
  { id: 's.g40', es: 'El banco está entre la panadería y el bar.', en: 'The bank is between the bakery and the bar.', concepts: ['v.entre'], level: 'A1', topics: ['directions', 'city'], blanks: ['entre'] },
  { id: 's.g41', es: 'El móvil está dentro del bolso.', en: 'The phone is inside the bag.', concepts: ['v.dentro-de', 'v.bolso'], level: 'A1', topics: ['directions'] },
  { id: 's.g42', es: 'Te espero fuera del edificio.', en: "I'll wait for you outside the building.", concepts: ['v.fuera-de', 'v.esperar', 'f.esperar.present'], level: 'A1', topics: ['directions'] },
  { id: 's.g43', es: 'Deja el abrigo sobre la silla.', en: 'Leave your coat on the chair.', concepts: ['v.sobre', 'v.abrigo', 'v.silla'], level: 'A1', topics: ['directions', 'home'] },
  { id: 's.g44', es: 'Sube arriba, te espero aquí abajo.', en: "Go up, I'll wait for you down here.", concepts: ['v.arriba', 'v.abajo', 'v.esperar'], level: 'A1', topics: ['directions'] },
  { id: 's.g45', es: 'El baño está al final del pasillo, a la derecha.', en: 'The toilet is at the end of the corridor, on the right.', concepts: ['v.bano'], level: 'A1', topics: ['directions'] },

  // --- Clothes -------------------------------------------------------------
  { id: 's.g46', es: 'Llevo una falda negra y un jersey gris.', en: "I'm wearing a black skirt and a grey jumper.", concepts: ['v.falda', 'v.jersey'], level: 'A1', topics: ['shopping', 'describing'] },
  { id: 's.g47', es: 'Hace frío, coge el abrigo.', en: "It's cold, take your coat.", concepts: ['v.abrigo'], level: 'A1', topics: ['shopping', 'weather'] },
  { id: 's.g48', es: 'No encuentro mis calcetines.', en: "I can't find my socks.", concepts: ['v.calcetines', 'v.encontrar', 'f.encontrar.present'], level: 'A1', topics: ['shopping', 'home'] },
  { id: 's.g49', es: 'Siempre lleva una gorra roja.', en: 'He always wears a red cap.', concepts: ['v.gorra'], level: 'A1', topics: ['shopping', 'describing'] },
  { id: 's.g50', es: 'En invierno llevo bufanda y guantes.', en: 'In winter I wear a scarf and gloves.', concepts: ['v.bufanda'], level: 'A1', topics: ['shopping', 'weather'] },
  { id: 's.g51', es: 'Sin las gafas no veo nada.', en: "Without my glasses I can't see a thing.", concepts: ['v.gafas'], level: 'A1', topics: ['shopping', 'describing'] },
  { id: 's.g52', es: 'He dejado el bolso en el coche.', en: "I've left my bag in the car.", concepts: ['v.bolso', 'v.dejar', 'f.dejar.presentPerfect'], level: 'A1', topics: ['shopping'] },
  { id: 's.g53', es: '¿Tiene esta camisa en otra talla?', en: 'Do you have this shirt in another size?', concepts: ['v.talla'], level: 'A1', topics: ['shopping'] },
  { id: 's.g54', es: 'Esta falda me queda un poco larga.', en: 'This skirt is a bit long on me.', concepts: ['v.falda', 'v.largo'], level: 'A1', topics: ['shopping'] },
  { id: 's.g55', es: 'Prefiero el jersey azul, es más corto.', en: 'I prefer the blue jumper, it is shorter.', concepts: ['v.jersey', 'v.corto'], level: 'A1', topics: ['shopping', 'describing'] },

  // --- Food ----------------------------------------------------------------
  { id: 's.g56', es: 'Un té con leche, por favor.', en: 'A tea with milk, please.', concepts: ['v.te'], level: 'A1', topics: ['cafe', 'food'] },
  { id: 's.g57', es: 'Como una manzana todos los días.', en: 'I eat an apple every day.', concepts: ['v.manzana'], level: 'A1', topics: ['food'] },
  { id: 's.g58', es: 'El zumo de naranja está muy bueno.', en: 'The orange juice is really good.', concepts: ['v.naranja'], level: 'A1', topics: ['food', 'cafe'] },
  { id: 's.g59', es: '¿Quieres un plátano?', en: 'Do you want a banana?', concepts: ['v.platano'], level: 'A1', topics: ['food'] },
  { id: 's.g60', es: 'Las patatas bravas son la tapa más famosa.', en: 'Patatas bravas are the most famous tapa.', concepts: ['v.patata'], level: 'A1', topics: ['food', 'cafe'] },
  { id: 's.g61', es: 'La ensalada lleva tomate y cebolla.', en: 'The salad has tomato and onion in it.', concepts: ['v.ensalada', 'v.tomate'], level: 'A1', topics: ['food', 'restaurant'] },
  { id: 's.g62', es: 'De primero quiero una sopa.', en: "For the first course I'd like a soup.", concepts: ['v.sopa'], level: 'A1', topics: ['restaurant', 'food'] },
  { id: 's.g63', es: 'Me tomo un bocadillo de jamón para comer.', en: "I'll have a ham baguette for lunch.", concepts: ['v.bocadillo'], level: 'A1', topics: ['food', 'cafe'] },
  { id: 's.g64', es: '¿Qué hay de postre?', en: "What's for dessert?", concepts: ['v.postre'], level: 'A1', topics: ['restaurant', 'food'] },
  { id: 's.g65', es: 'De postre, un helado de chocolate.', en: 'For dessert, a chocolate ice cream.', concepts: ['v.helado', 'v.postre'], level: 'A1', topics: ['restaurant', 'food'] },
  { id: 's.g66', es: 'Tomo el café sin azúcar.', en: 'I take my coffee without sugar.', concepts: ['v.azucar'], level: 'A1', topics: ['cafe', 'food'] },
  { id: 's.g67', es: '¿Me pasas la sal?', en: 'Could you pass me the salt?', concepts: ['v.sal'], level: 'A1', topics: ['food', 'restaurant'] },
  { id: 's.g68', es: 'En España se cocina todo con aceite de oliva.', en: 'In Spain everything is cooked with olive oil.', concepts: ['v.aceite'], level: 'A1', topics: ['food'] },
  { id: 's.g69', es: 'Tengo sed, ¿hay agua?', en: "I'm thirsty, is there any water?", concepts: ['v.tengo-sed'], level: 'A1', topics: ['food', 'cafe'] },
  { id: 's.g70', es: 'El plato está muy caliente.', en: 'The plate is very hot.', concepts: ['v.plato', 'v.caliente'], level: 'A1', topics: ['restaurant', 'describing'] },
  { id: 's.g71', es: '¿Me pones un vaso de agua?', en: 'Could I have a glass of water?', concepts: ['v.vaso'], level: 'A1', topics: ['cafe'] },
  { id: 's.g72', es: 'La sopa está fría.', en: 'The soup is cold.', concepts: ['v.sopa', 'v.frio-adj'], level: 'A1', topics: ['restaurant', 'describing'] },

  // --- Transport -----------------------------------------------------------
  { id: 's.g73', es: 'Vamos a coger un taxi, es más rápido.', en: "Let's take a taxi, it's quicker.", concepts: ['v.taxi'], level: 'A1', topics: ['transport'] },
  { id: 's.g74', es: 'Voy al trabajo en bici.', en: 'I go to work by bike.', concepts: ['v.bici'], level: 'A1', topics: ['transport', 'work'] },
  { id: 's.g75', es: 'El avión llega a las siete.', en: 'The plane arrives at seven.', concepts: ['v.avion', 'v.llegar', 'f.llegar.present'], level: 'A1', topics: ['transport', 'travel'] },
  { id: 's.g76', es: 'El aeropuerto está lejos del centro.', en: 'The airport is far from the centre.', concepts: ['v.aeropuerto'], level: 'A1', topics: ['transport', 'travel'] },
  { id: 's.g77', es: 'Llegué tarde porque perdí el tren.', en: 'I arrived late because I missed the train.', concepts: ['v.llegar', 'f.llegar.preterite'], level: 'A1', topics: ['transport'], note: 'Llegué, not llegé: the g becomes gu to keep its hard sound before the -é.' },
  { id: 's.g78', es: '¿A qué hora llegas al aeropuerto?', en: 'What time do you get to the airport?', concepts: ['v.aeropuerto', 'v.llegar'], level: 'A1', topics: ['transport', 'travel'] },

  // --- Time ----------------------------------------------------------------
  { id: 's.g79', es: 'Espera un minuto, por favor.', en: 'Wait a minute, please.', concepts: ['v.minuto', 'v.esperar', 'f.esperar.imperative'], level: 'A1', topics: ['time'] },
  { id: 's.g80', es: 'Me levanto muy temprano entre semana.', en: 'I get up very early during the week.', concepts: ['v.temprano'], level: 'A1', topics: ['time', 'daily-routine'] },
  { id: 's.g81', es: 'El tren sale en diez minutos.', en: 'The train leaves in ten minutes.', concepts: ['v.minuto'], level: 'A1', topics: ['time', 'transport'] },
  { id: 's.g82', es: 'Empiezo a trabajar a las nueve.', en: 'I start work at nine.', concepts: ['v.empezar', 'f.empezar.present'], level: 'A1', topics: ['time', 'work'] },
  { id: 's.g83', es: '¿A qué hora terminas hoy?', en: 'What time do you finish today?', concepts: ['v.terminar', 'f.terminar.present'], level: 'A1', topics: ['time', 'work'] },
  { id: 's.g84', es: 'La película empieza temprano.', en: 'The film starts early.', concepts: ['v.empezar', 'v.temprano'], level: 'A1', topics: ['time', 'hobbies'] },

  // --- People --------------------------------------------------------------
  { id: 's.g85', es: 'Mis padres llegan mañana por la tarde.', en: 'My parents arrive tomorrow afternoon.', concepts: ['v.padres', 'v.llegar'], level: 'A1', topics: ['family', 'time'] },
  { id: 's.g86', es: 'Mi primo tiene la misma edad que yo.', en: "My cousin is the same age as me.", concepts: ['v.primo'], level: 'A1', topics: ['family'] },
  { id: 's.g87', es: 'Su marido es profesor de inglés.', en: 'Her husband is an English teacher.', concepts: ['v.marido', 'v.profesor'], level: 'A1', topics: ['family', 'work'] },
  { id: 's.g88', es: 'Mis vecinos son muy simpáticos.', en: 'My neighbours are really nice.', concepts: ['v.vecino'], level: 'A1', topics: ['people', 'home'] },
  { id: 's.g89', es: 'Hay muchos niños en el parque.', en: 'There are a lot of children in the park.', concepts: ['v.nino'], level: 'A1', topics: ['people', 'city'] },
  { id: 's.g90', es: 'Ese hombre trabaja en la panadería.', en: 'That man works at the bakery.', concepts: ['v.hombre'], level: 'A1', topics: ['people', 'work'] },
  { id: 's.g91', es: 'La mujer de la tienda es muy amable.', en: 'The woman in the shop is very kind.', concepts: ['v.mujer'], level: 'A1', topics: ['people', 'shopping'] },
  { id: 's.g92', es: '¿Cuál es tu nombre completo?', en: "What's your full name?", concepts: ['v.nombre'], level: 'A1', topics: ['introductions'] },
  { id: 's.g93', es: 'Mi tía vive con mis padres.', en: 'My aunt lives with my parents.', concepts: ['v.padres'], level: 'A1', topics: ['family'] },

  // --- Shopping and money --------------------------------------------------
  { id: 's.g94', es: 'Compro la fruta en el mercado.', en: 'I buy fruit at the market.', concepts: ['v.mercado'], level: 'A1', topics: ['shopping', 'food'] },
  { id: 's.g95', es: '¿Cuál es el precio de este vestido?', en: "What's the price of this dress?", concepts: ['v.precio'], level: 'A1', topics: ['shopping'] },
  { id: 's.g96', es: 'Cuesta doce euros.', en: 'It costs twelve euros.', concepts: ['v.euro'], level: 'A1', topics: ['shopping', 'numbers'] },
  { id: 's.g97', es: '¿Se puede pagar con tarjeta?', en: 'Can I pay by card?', concepts: ['p.se-puede-pagar-tarjeta', 'v.tarjeta'], level: 'A1', topics: ['shopping'] },
  { id: 's.g98', es: 'Solo tengo efectivo.', en: 'I only have cash.', concepts: ['v.efectivo'], level: 'A1', topics: ['shopping'] },
  { id: 's.g99', es: '¿Me da el ticket, por favor?', en: 'Could I have the receipt, please?', concepts: ['v.ticket'], level: 'A1', topics: ['shopping'] },
  { id: 's.g100', es: 'El mercado abre a las ocho.', en: 'The market opens at eight.', concepts: ['v.mercado', 'v.abrir', 'f.abrir.present'], level: 'A1', topics: ['shopping', 'time'] },
  { id: 's.g101', es: 'La tienda cierra a las dos.', en: 'The shop closes at two.', concepts: ['v.cerrar', 'f.cerrar.present'], level: 'A1', topics: ['shopping', 'time'] },

  // --- Weather -------------------------------------------------------------
  { id: 's.g102', es: 'En el norte nieva mucho en invierno.', en: 'It snows a lot in the north in winter.', concepts: ['v.nieva'], level: 'A1', topics: ['weather'] },
  { id: 's.g103', es: 'Hay mucha nieve en la montaña.', en: "There's a lot of snow on the mountain.", concepts: ['v.nieve'], level: 'A1', topics: ['weather'] },
  { id: 's.g104', es: 'No me gusta la lluvia.', en: "I don't like the rain.", concepts: ['v.lluvia'], level: 'A1', topics: ['weather'] },
  { id: 's.g105', es: 'Hoy está nublado.', en: "It's cloudy today.", concepts: ['v.nublado'], level: 'A1', topics: ['weather'], note: 'Nublado is a state, so it takes estar — not hace.' },
  { id: 's.g106', es: 'Viene una tormenta.', en: "There's a storm coming.", concepts: ['v.tormenta'], level: 'A1', topics: ['weather'] },
  { id: 's.g107', es: 'Estamos a treinta grados.', en: "It's thirty degrees.", concepts: ['v.grado'], level: 'A1', topics: ['weather', 'numbers'], note: 'Spain says estar a for the temperature: estamos a treinta.' },
  { id: 's.g108', es: 'Hace buen tiempo, vamos a la playa.', en: "The weather's good, let's go to the beach.", concepts: ['v.buen-tiempo'], level: 'A1', topics: ['weather', 'plans'] },
  { id: 's.g109', es: 'Hace mal tiempo, mejor nos quedamos en casa.', en: "The weather's bad, we'd better stay at home.", concepts: ['v.mal-tiempo'], level: 'A1', topics: ['weather', 'plans'] },
  { id: 's.g110', es: 'Coge el abrigo, hace mal tiempo.', en: "Take your coat, the weather's bad.", concepts: ['v.mal-tiempo', 'v.abrigo'], level: 'A1', topics: ['weather'] },

  // --- Everyday actions ----------------------------------------------------
  { id: 's.g111', es: '¿Me ayudas a llevar esto?', en: 'Can you help me carry this?', concepts: ['v.ayudar', 'f.ayudar.present'], level: 'A1', topics: ['daily-routine', 'social'] },
  { id: 's.g112', es: 'Siempre ayudo a mi madre los domingos.', en: 'I always help my mother on Sundays.', concepts: ['v.ayudar'], level: 'A1', topics: ['family', 'daily-routine'] },
  { id: 's.g113', es: 'Estoy buscando las llaves.', en: "I'm looking for the keys.", concepts: ['v.buscar'], level: 'A1', topics: ['daily-routine'], note: 'Buscar already means "look for" — no preposition after it.' },
  { id: 's.g114', es: 'Busqué el móvil por toda la casa.', en: 'I looked for my phone all over the house.', concepts: ['v.buscar', 'f.buscar.preterite'], level: 'A1', topics: ['daily-routine'], note: 'Busqué, not buscé: the c becomes qu before the -é.' },
  { id: 's.g115', es: 'No encuentro el billete.', en: "I can't find the ticket.", concepts: ['v.encontrar'], level: 'A1', topics: ['daily-routine', 'transport'] },
  { id: 's.g116', es: 'Duermo ocho horas cada noche.', en: 'I sleep eight hours a night.', concepts: ['v.dormir', 'f.dormir.present'], level: 'A1', topics: ['daily-routine'] },
  { id: 's.g117', es: 'Anoche dormí fatal.', en: 'Last night I slept terribly.', concepts: ['v.dormir', 'f.dormir.preterite'], level: 'A1', topics: ['daily-routine'] },
  { id: 's.g118', es: 'Necesito un café ahora mismo.', en: 'I need a coffee right now.', concepts: ['v.necesitar'], level: 'A1', topics: ['daily-routine', 'cafe'] },
  { id: 's.g119', es: '¿Necesitáis ayuda con las maletas?', en: 'Do you need help with the suitcases?', concepts: ['v.necesitar', 'f.necesitar.present'], level: 'A1', topics: ['travel'] },
  { id: 's.g120', es: 'Te espero en la puerta.', en: "I'll wait for you at the door.", concepts: ['v.esperar', 'v.puerta'], level: 'A1', topics: ['daily-routine', 'social'] },
  { id: 's.g121', es: 'Esperamos media hora en la estación.', en: 'We waited half an hour at the station.', concepts: ['v.esperar', 'f.esperar.preterite'], level: 'A1', topics: ['transport'] },
  { id: 's.g122', es: 'La clase empieza a las diez y termina a las doce.', en: 'The class starts at ten and finishes at twelve.', concepts: ['v.empezar', 'v.terminar'], level: 'A1', topics: ['university', 'time'] },
  { id: 's.g123', es: '¿Ya has terminado el trabajo?', en: 'Have you finished the work yet?', concepts: ['v.terminar', 'f.terminar.presentPerfect'], level: 'A1', topics: ['work'] },
  { id: 's.g124', es: 'Llego a casa sobre las seis.', en: 'I get home around six.', concepts: ['v.llegar', 'v.sobre'], level: 'A1', topics: ['daily-routine', 'time'] },
  { id: 's.g125', es: 'Pasa algo raro con el ordenador.', en: "Something odd is going on with the computer.", concepts: ['v.pasar', 'f.pasar.present'], level: 'A1', topics: ['daily-routine'] },
  { id: 's.g126', es: '¿Qué te pasa?', en: "What's wrong with you?", concepts: ['v.pasar'], level: 'A1', topics: ['social', 'health'] },
  { id: 's.g127', es: 'Pasamos el fin de semana en la playa.', en: 'We spent the weekend at the beach.', concepts: ['v.pasar', 'f.pasar.preterite'], level: 'A1', topics: ['travel', 'past'] },

  // --- Describing ----------------------------------------------------------
  { id: 's.g128', es: 'Es un coche viejo pero funciona bien.', en: "It's an old car but it works well.", concepts: ['v.viejo'], level: 'A1', topics: ['describing'] },
  { id: 's.g129', es: 'Tengo un móvil nuevo.', en: 'I have a new phone.', concepts: ['v.nuevo'], level: 'A1', topics: ['describing'] },
  { id: 's.g130', es: 'Hoy ha sido un mal día.', en: "Today's been a bad day.", concepts: ['v.malo'], level: 'A1', topics: ['describing'], note: 'Malo shortens to mal before a masculine singular noun.' },
  { id: 's.g131', es: 'El café está caliente.', en: 'The coffee is hot.', concepts: ['v.caliente'], level: 'A1', topics: ['describing', 'cafe'] },
  { id: 's.g132', es: 'La sopa está fría y el pan está duro.', en: 'The soup is cold and the bread is stale.', concepts: ['v.frio-adj', 'v.sopa'], level: 'A1', topics: ['describing', 'restaurant'] },
  { id: 's.g133', es: 'Es una calle muy larga.', en: "It's a very long street.", concepts: ['v.largo'], level: 'A1', topics: ['describing', 'city'] },
  { id: 's.g134', es: 'El vídeo es corto, dura dos minutos.', en: "The video is short, it's two minutes long.", concepts: ['v.corto', 'v.minuto'], level: 'A1', topics: ['describing'] },
  { id: 's.g135', es: 'La habitación está limpia.', en: 'The room is clean.', concepts: ['v.limpio', 'v.habitacion'], level: 'A1', topics: ['describing', 'home'] },
  { id: 's.g136', es: 'Los zapatos están sucios.', en: 'The shoes are dirty.', concepts: ['v.sucio'], level: 'A1', topics: ['describing'] },

  // --- School and work -----------------------------------------------------
  { id: 's.g137', es: 'Trabajo en una oficina en el centro.', en: 'I work in an office in the centre.', concepts: ['v.oficina'], level: 'A1', topics: ['work', 'city'] },
  { id: 's.g138', es: 'Mis hijos van al colegio en autobús.', en: 'My children go to school by bus.', concepts: ['v.colegio'], level: 'A1', topics: ['university', 'transport'] },
  { id: 's.g139', es: 'La profesora habla muy despacio.', en: 'The teacher speaks very slowly.', concepts: ['v.profesor'], level: 'A1', topics: ['university'] },
  { id: 's.g140', es: 'Soy estudiante de medicina.', en: "I'm a medical student.", concepts: ['v.estudiante'], level: 'A1', topics: ['university'] },
  { id: 's.g141', es: 'Te mando un correo esta tarde.', en: "I'll send you an email this afternoon.", concepts: ['v.correo'], level: 'A1', topics: ['work'] },
  { id: 's.g142', es: 'Tengo un examen el jueves.', en: 'I have an exam on Thursday.', concepts: ['v.examen'], level: 'A1', topics: ['university', 'time'] },
  { id: 's.g143', es: 'El examen empieza a las nueve en punto.', en: 'The exam starts at nine on the dot.', concepts: ['v.examen', 'v.empezar'], level: 'A1', topics: ['university', 'time'] },
  { id: 's.g144', es: 'La oficina cierra a las seis.', en: 'The office closes at six.', concepts: ['v.oficina', 'v.cerrar'], level: 'A1', topics: ['work', 'time'] },

  // --- Getting by ----------------------------------------------------------
  { id: 's.g145', es: '¿Cómo se dice "window" en español?', en: 'How do you say "window" in Spanish?', concepts: ['p.como-se-dice', 'v.ventana'], level: 'A1', topics: ['social', 'greetings'] },
  { id: 's.g146', es: '¡Socorro! ¡Ayuda!', en: 'Help! Help!', concepts: ['p.socorro'], level: 'A1', topics: ['health', 'social'], noAudio: true },
  { id: 's.g147', es: 'Perdone, ¿el baño está arriba o abajo?', en: 'Excuse me, is the toilet upstairs or downstairs?', concepts: ['v.bano', 'v.arriba', 'v.abajo'], level: 'A1', topics: ['directions', 'city'], note: 'Perdone is the usted form — the one to use with a stranger behind a bar.' },
  { id: 's.g148', es: 'Necesito ayuda, por favor.', en: 'I need help, please.', concepts: ['v.necesitar'], level: 'A1', topics: ['social'] },
];
