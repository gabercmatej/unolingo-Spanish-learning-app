import type { Sentence } from '@/content/types';

/**
 * The town, the trip, and the phrases for marking how sure you are.
 *
 * Written to close a specific audit warning: **21 concepts taught with no
 * sentence at all**. A concept a lesson declares but no sentence carries is
 * worse than one the course never mentions — it enters the learner's state,
 * takes a slot in a session, and can only ever be met as a bare teaching card
 * followed by a multiple choice against unrelated distractors. The vocabulary
 * for the whole of a Spanish town arrived that way.
 *
 * Three sentences apiece, minimum, and each in a different frame — where the
 * thing is, what you do there, and it in a sentence somebody would actually
 * say — because `getSentencesForConcept` draws from this pool and a concept
 * with one line comes back as the same line under every exercise kind.
 */
export const cityAndStanceSentences: Sentence[] = [
  // --- The town ------------------------------------------------------------
  { id: 's.t1', es: 'El banco está enfrente de la iglesia.', en: 'The bank is opposite the church.', concepts: ['v.banco', 'v.iglesia'], level: 'A2', topics: ['city', 'directions'] },
  { id: 's.t2', es: 'Tengo que pasar por el banco esta mañana.', en: 'I have to go by the bank this morning.', concepts: ['v.banco', 'v.pasar'], level: 'A2', topics: ['city', 'daily-routine'] },
  { id: 's.t3', es: '¿Hay algún banco por aquí cerca?', en: 'Is there a bank near here?', concepts: ['v.banco'], level: 'A2', topics: ['city', 'directions'] },

  { id: 's.t4', es: 'El hospital está a las afueras del pueblo.', en: 'The hospital is on the outskirts of the village.', concepts: ['v.hospital', 'v.pueblo'], level: 'A2', topics: ['city', 'health'] },
  { id: 's.t5', es: 'Lo llevaron al hospital en ambulancia.', en: 'They took him to hospital in an ambulance.', concepts: ['v.hospital'], level: 'B1', topics: ['health', 'past'] },
  { id: 's.t6', es: 'Trabajo en el hospital desde hace tres años.', en: "I've worked at the hospital for three years.", concepts: ['v.hospital'], level: 'A2', topics: ['work', 'health'] },

  { id: 's.t7', es: 'Llama a la policía, por favor.', en: 'Call the police, please.', concepts: ['v.policia'], level: 'A2', topics: ['city'] },
  { id: 's.t8', es: 'La policía cortó la calle toda la tarde.', en: 'The police closed the street all afternoon.', concepts: ['v.policia'], level: 'B1', topics: ['city', 'past'] },
  { id: 's.t9', es: 'Hay dos coches de policía en la plaza.', en: 'There are two police cars in the square.', concepts: ['v.policia'], level: 'A2', topics: ['city'] },

  { id: 's.t10', es: 'Los niños juegan en el parque todas las tardes.', en: 'The children play in the park every afternoon.', concepts: ['v.parque', 'v.nino', 'v.jugar'], level: 'A2', topics: ['city', 'family'] },
  { id: 's.t11', es: 'Vamos a dar una vuelta por el parque.', en: "Let's go for a walk in the park.", concepts: ['v.parque'], level: 'A2', topics: ['city', 'plans'] },
  { id: 's.t12', es: 'El parque cierra a las diez.', en: 'The park closes at ten.', concepts: ['v.parque', 'v.cerrar'], level: 'A2', topics: ['city', 'time'] },

  { id: 's.t13', es: 'El museo es gratis los domingos.', en: 'The museum is free on Sundays.', concepts: ['v.museo'], level: 'A2', topics: ['city', 'travel'] },
  { id: 's.t14', es: 'Pasamos toda la mañana en el museo.', en: 'We spent the whole morning at the museum.', concepts: ['v.museo', 'v.pasar'], level: 'A2', topics: ['travel', 'past'] },
  { id: 's.t15', es: '¿Has estado en el museo del Prado?', en: 'Have you been to the Prado museum?', concepts: ['v.museo'], level: 'A2', topics: ['travel'] },

  { id: 's.t16', es: 'La iglesia del pueblo es del siglo dieciséis.', en: "The village church is from the sixteenth century.", concepts: ['v.iglesia', 'v.pueblo'], level: 'B1', topics: ['travel', 'city'] },
  { id: 's.t17', es: 'Quedamos delante de la iglesia.', en: "Let's meet in front of the church.", concepts: ['v.iglesia'], level: 'A2', topics: ['plans', 'directions'] },

  { id: 's.t18', es: 'Vivo en el centro, al lado del mercado.', en: 'I live in the centre, next to the market.', concepts: ['v.centro', 'v.mercado'], level: 'A2', topics: ['city', 'home'] },
  { id: 's.t19', es: 'El centro está lleno de turistas en agosto.', en: 'The centre is full of tourists in August.', concepts: ['v.centro', 'v.turista'], level: 'A2', topics: ['city', 'travel'] },
  { id: 's.t20', es: '¿Cómo se va al centro desde aquí?', en: 'How do you get to the centre from here?', concepts: ['v.centro'], level: 'A2', topics: ['directions'] },

  { id: 's.t21', es: 'La oficina de correos abre a las nueve.', en: 'The post office opens at nine.', concepts: ['v.oficina-correos', 'v.abrir'], level: 'A2', topics: ['city', 'time'] },
  { id: 's.t22', es: 'Tengo que ir a la oficina de correos a por un paquete.', en: 'I have to go to the post office for a parcel.', concepts: ['v.oficina-correos'], level: 'B1', topics: ['city'] },
  { id: 's.t23', es: '¿Dónde está la oficina de correos más cercana?', en: 'Where is the nearest post office?', concepts: ['v.oficina-correos'], level: 'A2', topics: ['city', 'directions'] },

  // --- Travel --------------------------------------------------------------
  { id: 's.t24', es: 'En invierno vamos a la montaña a esquiar.', en: 'In winter we go to the mountains to ski.', concepts: ['v.montana'], level: 'A2', topics: ['travel', 'weather'] },
  { id: 's.t25', es: 'Se ve la montaña desde la ventana.', en: 'You can see the mountain from the window.', concepts: ['v.montana', 'v.ventana'], level: 'A2', topics: ['travel', 'home'] },
  { id: 's.t26', es: 'La montaña estaba cubierta de nieve.', en: 'The mountain was covered in snow.', concepts: ['v.montana', 'v.nieve'], level: 'B1', topics: ['weather', 'travel'] },

  { id: 's.t27', es: 'Deja el equipaje en la habitación.', en: 'Leave the luggage in the room.', concepts: ['v.equipaje', 'v.habitacion', 'v.dejar'], level: 'A2', topics: ['travel'] },
  { id: 's.t28', es: 'Perdieron mi equipaje en el aeropuerto.', en: 'They lost my luggage at the airport.', concepts: ['v.equipaje', 'v.aeropuerto', 'v.perder'], level: 'B1', topics: ['travel', 'past'] },
  { id: 's.t29', es: 'Llevo poco equipaje, solo una maleta.', en: "I'm travelling light, just one suitcase.", concepts: ['v.equipaje'], level: 'A2', topics: ['travel'] },

  { id: 's.t30', es: 'Nos quedamos tres noches en Granada.', en: 'We stayed three nights in Granada.', concepts: ['v.quedarse'], level: 'A2', topics: ['travel', 'past'] },
  { id: 's.t31', es: '¿Te quedas a cenar?', en: 'Are you staying for dinner?', concepts: ['v.quedarse'], level: 'A2', topics: ['social', 'food'] },
  { id: 's.t32', es: 'Me quedo en casa, hace mal tiempo.', en: "I'm staying at home, the weather's bad.", concepts: ['v.quedarse', 'v.mal-tiempo'], level: 'A2', topics: ['weather', 'plans'] },

  // --- Feelings ------------------------------------------------------------
  { id: 's.t33', es: 'Me quedé muy sorprendido con la noticia.', en: 'I was really surprised by the news.', concepts: ['v.sorprendido', 'v.quedarse'], level: 'A2', topics: ['feelings', 'past'] },
  { id: 's.t34', es: 'Está sorprendida de lo bien que hablas.', en: 'She is surprised at how well you speak.', concepts: ['v.sorprendido'], level: 'B1', topics: ['feelings'] },
  { id: 's.t35', es: 'Nos miró sorprendido y no dijo nada.', en: 'He looked at us in surprise and said nothing.', concepts: ['v.sorprendido'], level: 'B1', topics: ['feelings', 'storytelling'] },

  { id: 's.t36', es: 'Estoy aburrido, no hay nada que hacer.', en: "I'm bored, there's nothing to do.", concepts: ['v.aburrido'], level: 'A2', topics: ['feelings'] },
  { id: 's.t37', es: 'La película era muy aburrida.', en: 'The film was really boring.', concepts: ['v.aburrido'], level: 'A2', topics: ['hobbies', 'past'] },
  { id: 's.t38', es: 'Estar aburrido y ser aburrido no es lo mismo.', en: 'Being bored and being boring are not the same thing.', concepts: ['v.aburrido'], level: 'B1', topics: ['describing'], note: 'The classic ser/estar pair: estar aburrido is how you feel, ser aburrido is what you are.' },

  // --- Obligation and stance ----------------------------------------------
  { id: 's.t39', es: 'Debo irme, ya es tarde.', en: 'I should go, it is late already.', concepts: ['v.deber'], level: 'A2', topics: ['plans', 'time'] },
  { id: 's.t40', es: 'Deberías descansar un poco.', en: 'You should rest a bit.', concepts: ['v.deber'], level: 'A2', topics: ['health', 'opinions'] },
  { id: 's.t41', es: 'No debes preocuparte tanto.', en: 'You should not worry so much.', concepts: ['v.deber'], level: 'B1', topics: ['feelings'] },

  { id: 's.t42', es: '—¿Vienes mañana? —Depende.', en: '"Are you coming tomorrow?" "It depends."', concepts: ['p.depende'], level: 'A2', topics: ['plans'] },
  { id: 's.t43', es: 'Depende del tiempo que haga.', en: 'It depends on the weather.', concepts: ['p.depende', 'v.depender-de'], level: 'B1', topics: ['weather', 'plans'] },
  { id: 's.t44', es: 'Todo depende de lo que decidan ellos.', en: 'It all depends on what they decide.', concepts: ['v.depender-de'], level: 'B1', topics: ['opinions'] },
  { id: 's.t45', es: 'El precio depende de la talla.', en: 'The price depends on the size.', concepts: ['v.depender-de', 'v.precio', 'v.talla'], level: 'B1', topics: ['shopping'] },

  { id: 's.t46', es: 'Que yo sepa, no ha llamado nadie.', en: 'As far as I know, nobody has called.', concepts: ['p.que-yo-sepa'], level: 'B2', topics: ['opinions'] },
  { id: 's.t47', es: 'Que yo sepa, la reunión sigue en pie.', en: "As far as I know, the meeting is still on.", concepts: ['p.que-yo-sepa'], level: 'B2', topics: ['work'] },
  { id: 's.t48', es: 'No es obligatorio, que yo sepa.', en: 'It is not compulsory, as far as I know.', concepts: ['p.que-yo-sepa'], level: 'B2', topics: ['opinions'] },

  { id: 's.t49', es: 'Estaba a punto de llamarte.', en: 'I was about to call you.', concepts: ['p.estar-a-punto-de'], level: 'B2', topics: ['social', 'past'] },
  { id: 's.t50', es: 'El tren está a punto de salir.', en: 'The train is about to leave.', concepts: ['p.estar-a-punto-de'], level: 'B2', topics: ['transport'] },
  { id: 's.t51', es: 'Estuvimos a punto de perder el vuelo.', en: 'We were about to miss the flight.', concepts: ['p.estar-a-punto-de', 'v.perder'], level: 'B2', topics: ['travel', 'past'] },

  { id: 's.t52', es: 'No des por hecho que van a aceptar.', en: 'Do not take it for granted that they will accept.', concepts: ['p.dar-por-hecho'], level: 'B2', topics: ['opinions'] },
  { id: 's.t53', es: 'Damos por hecho que todos están de acuerdo.', en: 'We are taking it for granted that everyone agrees.', concepts: ['p.dar-por-hecho'], level: 'B2', topics: ['work'] },
  { id: 's.t54', es: 'Lo dieron por hecho sin preguntar a nadie.', en: 'They took it for granted without asking anyone.', concepts: ['p.dar-por-hecho'], level: 'B2', topics: ['work', 'past'] },

  { id: 's.t55', es: 'Conviene destacar dos cosas.', en: 'Two things are worth highlighting.', concepts: ['v.destacar'], level: 'B2', topics: ['opinions', 'work'] },
  { id: 's.t56', es: 'Destacó por encima del resto del equipo.', en: 'She stood out above the rest of the team.', concepts: ['v.destacar'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.t57', es: 'Me gustaría destacar el esfuerzo de todos.', en: "I'd like to highlight everyone's effort.", concepts: ['v.destacar'], level: 'B2', topics: ['work'] },

  { id: 's.t58', es: 'La única desventaja es el precio.', en: 'The only disadvantage is the price.', concepts: ['v.desventaja', 'v.precio'], level: 'B2', topics: ['opinions', 'shopping'] },
  { id: 's.t59', es: 'Tiene más ventajas que desventajas.', en: 'It has more advantages than disadvantages.', concepts: ['v.desventaja'], level: 'B2', topics: ['opinions'] },
  { id: 's.t60', es: 'La mayor desventaja es la distancia.', en: 'The biggest disadvantage is the distance.', concepts: ['v.desventaja'], level: 'B2', topics: ['opinions'] },

  // --- hay, obligation and the se passive ---------------------------------
  { id: 's.t61', es: 'Hay catorce sillas en el salón.', en: 'There are fourteen chairs in the living room.', concepts: ['p.hay', 'v.catorce', 'v.silla', 'v.salon'], level: 'A1', topics: ['home', 'numbers'] },
  /**
   * `catorce` had sentences and not one the learner could read at the point it
   * is taught — every line carrying it also carried a word from later in the
   * course. Built here from nothing but numbers and `años`, both of which are
   * in place well before the number is.
   */
  { id: 's.t73', es: 'Mi hermano tiene catorce años.', en: 'My brother is fourteen.', concepts: ['v.catorce', 'v.anos', 'v.hermano'], level: 'A1', topics: ['numbers', 'family'] },
  { id: 's.t62', es: 'Hay un parque muy grande cerca de casa.', en: "There's a very big park near home.", concepts: ['p.hay', 'v.parque'], level: 'A1', topics: ['city'] },
  { id: 's.t63', es: 'No hay nada en la nevera.', en: "There's nothing in the fridge.", concepts: ['p.hay', 'v.nevera'], level: 'A1', topics: ['home', 'food'] },
  { id: 's.t64', es: 'Tengo que terminar esto antes del jueves.', en: 'I have to finish this before Thursday.', concepts: ['g.obligation', 'v.terminar'], level: 'A2', topics: ['work'] },
  { id: 's.t65', es: 'Hay que cerrar la puerta al salir.', en: 'You have to close the door on your way out.', concepts: ['g.obligation', 'v.cerrar', 'v.puerta'], level: 'A2', topics: ['home'] },
  { id: 's.t66', es: 'Debes descansar más.', en: 'You should rest more.', concepts: ['g.obligation', 'v.deber'], level: 'A2', topics: ['health'] },
  { id: 's.t67', es: 'Hay que reservar con antelación.', en: 'You have to book in advance.', concepts: ['g.obligation'], level: 'A2', topics: ['restaurant', 'travel'] },
  { id: 's.t68', es: 'Aquí se habla español.', en: 'Spanish is spoken here.', concepts: ['g.passive-se'], level: 'B2', topics: ['city'] },
  { id: 's.t69', es: 'Se venden pisos en este edificio.', en: 'Flats are for sale in this building.', concepts: ['g.passive-se'], level: 'B2', topics: ['home', 'city'] },
  { id: 's.t70', es: 'Se permiten perros en la terraza.', en: 'Dogs are allowed on the terrace.', concepts: ['g.passive-se', 'v.permitir'], level: 'B2', topics: ['city'] },
  { id: 's.t71', es: 'Las obras fueron terminadas en marzo.', en: 'The works were finished in March.', concepts: ['g.passive-se', 'v.terminar'], level: 'B2', topics: ['city', 'past'] },
  { id: 's.t72', es: 'Se necesita camarero con experiencia.', en: 'Experienced waiter needed.', concepts: ['g.passive-se', 'v.necesitar'], level: 'B2', topics: ['work'] },
];
