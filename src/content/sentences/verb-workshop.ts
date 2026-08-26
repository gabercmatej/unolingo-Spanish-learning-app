import type { Sentence } from '@/content/types';

/**
 * The corpus behind the course's high-frequency verbs, across the tenses they
 * actually appear in.
 *
 * `content/verb-corpus.ts` derives which sentences illustrate which paradigm by
 * **matching the conjugated form in the text** — authors tag nothing. So a
 * paradigm is only reachable if some sentence in the corpus contains one of its
 * forms, and a verb added with a conjugation table and no sentences is a table
 * the learner can look at and never practise. That is exactly the state the
 * course's 101 paradigms were in before the conjugation system was wired up,
 * and adding forty-four verbs without this file would recreate it at scale.
 *
 * Written per verb rather than per tense, so each verb arrives with a small
 * cluster of lines a learner could actually say — present, a past, and whichever
 * of future / conditional / subjunctive that verb genuinely turns up in. Spread
 * across persons on purpose, with `vosotros` deliberately over-represented
 * relative to real frequency: it is what makes this course Peninsular and it is
 * the thinnest person in the corpus.
 */
export const verbWorkshopSentences: Sentence[] = [
  // --- llegar --------------------------------------------------------------
  { id: 's.n1', es: 'Llegamos a Madrid a las nueve de la noche.', en: 'We got to Madrid at nine in the evening.', concepts: ['v.llegar'], level: 'A2', topics: ['travel', 'transport'] },
  { id: 's.n2', es: 'Ayer llegué el último a la oficina.', en: 'Yesterday I was the last to arrive at the office.', concepts: ['v.llegar', 'v.oficina'], level: 'A2', topics: ['work', 'past'] },
  { id: 's.n3', es: 'Antes llegaba tarde a todo.', en: 'I used to be late for everything.', concepts: ['v.llegar'], level: 'B1', topics: ['past'] },
  { id: 's.n4', es: 'Ya han llegado tus padres.', en: 'Your parents have arrived.', concepts: ['v.llegar', 'v.padres'], level: 'A2', topics: ['family'] },
  { id: 's.n5', es: 'Llegaré sobre las siete, ¿te va bien?', en: "I'll get there around seven, does that work for you?", concepts: ['v.llegar'], level: 'B1', topics: ['plans'] },
  { id: 's.n6', es: 'Cuando llegues, llámame.', en: 'When you get there, call me.', concepts: ['v.llegar'], level: 'B1', topics: ['plans'], note: 'Cuando + subjunctive for something that has not happened yet.' },
  { id: 's.n7', es: '¿A qué hora llegáis vosotros?', en: 'What time are you lot arriving?', concepts: ['v.llegar'], level: 'A1', topics: ['plans'] },

  // --- pasar ---------------------------------------------------------------
  { id: 's.n8', es: '¿Qué pasó ayer en la reunión?', en: 'What happened in the meeting yesterday?', concepts: ['v.pasar'], level: 'A2', topics: ['work', 'past'] },
  { id: 's.n9', es: 'Pasábamos los veranos en el pueblo.', en: 'We used to spend the summers in the village.', concepts: ['v.pasar'], level: 'B1', topics: ['past', 'storytelling'] },
  { id: 's.n10', es: 'No ha pasado nada, tranquilo.', en: 'Nothing happened, relax.', concepts: ['v.pasar'], level: 'A2', topics: ['social'] },
  { id: 's.n11', es: 'Pasad, pasad, la puerta está abierta.', en: 'Come in, come in, the door is open.', concepts: ['v.pasar', 'v.puerta'], level: 'A2', topics: ['social', 'home'] },
  { id: 's.n12', es: 'Espero que lo paséis bien.', en: 'I hope you have a good time.', concepts: ['v.pasar', 'v.esperar'], level: 'B1', topics: ['social'] },

  // --- necesitar -----------------------------------------------------------
  { id: 's.n13', es: 'Necesitamos más sillas para la cena.', en: 'We need more chairs for dinner.', concepts: ['v.necesitar', 'v.silla'], level: 'A1', topics: ['home'] },
  { id: 's.n14', es: 'Necesité ayuda para mover el sofá.', en: 'I needed help to move the sofa.', concepts: ['v.necesitar', 'v.sofa'], level: 'A2', topics: ['home', 'past'] },
  { id: 's.n15', es: 'Necesitaré el coche el sábado.', en: "I'll need the car on Saturday.", concepts: ['v.necesitar'], level: 'B1', topics: ['plans'] },
  { id: 's.n16', es: 'Si necesitáis algo, decídmelo.', en: 'If you need anything, tell me.', concepts: ['v.necesitar'], level: 'B1', topics: ['social'] },

  // --- esperar -------------------------------------------------------------
  { id: 's.n17', es: 'Esperé media hora bajo la lluvia.', en: 'I waited half an hour in the rain.', concepts: ['v.esperar', 'v.lluvia'], level: 'A2', topics: ['past', 'weather'] },
  { id: 's.n18', es: 'Te esperábamos a las ocho.', en: 'We were expecting you at eight.', concepts: ['v.esperar'], level: 'B1', topics: ['plans', 'past'] },
  { id: 's.n19', es: 'Espero que todo salga bien.', en: 'I hope everything goes well.', concepts: ['v.esperar'], level: 'B1', topics: ['social'], note: 'Esperar que takes the subjunctive: salga, not sale.' },
  { id: 's.n20', es: 'Esperad aquí un momento.', en: 'Wait here a moment.', concepts: ['v.esperar'], level: 'A2', topics: ['social'] },
  { id: 's.n21', es: 'He esperado toda la tarde.', en: "I've been waiting all afternoon.", concepts: ['v.esperar'], level: 'A2', topics: ['time'] },

  // --- ayudar --------------------------------------------------------------
  { id: 's.n22', es: 'Mi hermano me ayudó con la mudanza.', en: 'My brother helped me with the move.', concepts: ['v.ayudar'], level: 'A2', topics: ['family', 'past'] },
  { id: 's.n23', es: 'De pequeño ayudaba a mi padre en la tienda.', en: 'As a child I used to help my father in the shop.', concepts: ['v.ayudar'], level: 'B1', topics: ['past', 'family'] },
  { id: 's.n24', es: '¿Nos ayudáis a limpiar la cocina?', en: 'Will you help us clean the kitchen?', concepts: ['v.ayudar', 'v.cocina'], level: 'A2', topics: ['home'] },
  { id: 's.n25', es: 'Te ayudaría, pero estoy liado.', en: "I'd help you, but I'm snowed under.", concepts: ['v.ayudar'], level: 'B1', topics: ['social'] },
  { id: 's.n26', es: 'Ayúdame, por favor.', en: 'Help me, please.', concepts: ['v.ayudar'], level: 'A1', topics: ['social'] },

  // --- buscar --------------------------------------------------------------
  { id: 's.n27', es: 'Buscamos un piso cerca del centro.', en: "We're looking for a flat near the centre.", concepts: ['v.buscar'], level: 'A2', topics: ['home', 'city'] },
  { id: 's.n28', es: 'Buscaba las gafas y las tenía puestas.', en: 'I was looking for my glasses and I was wearing them.', concepts: ['v.buscar', 'v.gafas'], level: 'B1', topics: ['past'] },
  { id: 's.n29', es: 'He buscado por toda la casa.', en: "I've looked all over the house.", concepts: ['v.buscar'], level: 'A2', topics: ['home'] },
  { id: 's.n30', es: 'Busca en el cajón de la cocina.', en: 'Look in the kitchen drawer.', concepts: ['v.buscar', 'v.cocina'], level: 'A2', topics: ['home'] },
  { id: 's.n31', es: 'Buscaremos otra solución.', en: "We'll look for another solution.", concepts: ['v.buscar'], level: 'B1', topics: ['work'] },

  // --- abrir ---------------------------------------------------------------
  { id: 's.n32', es: 'La tienda abrió hace una hora.', en: 'The shop opened an hour ago.', concepts: ['v.abrir'], level: 'A2', topics: ['shopping', 'past'] },
  { id: 's.n33', es: 'Antes abrían los domingos.', en: 'They used to open on Sundays.', concepts: ['v.abrir'], level: 'B1', topics: ['shopping', 'past'] },
  { id: 's.n34', es: 'Han abierto un bar nuevo en la plaza.', en: "They've opened a new bar on the square.", concepts: ['v.abrir', 'v.nuevo'], level: 'A2', topics: ['city'] },
  { id: 's.n35', es: 'Abrid las ventanas, hace calor.', en: "Open the windows, it's hot.", concepts: ['v.abrir', 'v.ventana'], level: 'A2', topics: ['home', 'weather'] },
  { id: 's.n36', es: 'Mañana abriremos a las ocho.', en: "Tomorrow we'll open at eight.", concepts: ['v.abrir'], level: 'B1', topics: ['work'] },

  // --- cerrar --------------------------------------------------------------
  { id: 's.n37', es: 'Cerré la puerta con llave.', en: 'I locked the door.', concepts: ['v.cerrar', 'v.puerta'], level: 'A2', topics: ['home', 'past'] },
  { id: 's.n38', es: 'La farmacia cerraba a las dos.', en: 'The chemist used to close at two.', concepts: ['v.cerrar'], level: 'B1', topics: ['city', 'past'] },
  { id: 's.n39', es: 'Han cerrado la calle por obras.', en: "They've closed the street for roadworks.", concepts: ['v.cerrar'], level: 'A2', topics: ['city'] },
  { id: 's.n40', es: 'Cerrad bien la nevera.', en: 'Close the fridge properly.', concepts: ['v.cerrar', 'v.nevera'], level: 'A2', topics: ['home'] },
  { id: 's.n41', es: 'No creo que cierren tan pronto.', en: "I don't think they'll close that early.", concepts: ['v.cerrar'], level: 'B1', topics: ['opinions'] },

  // --- empezar / terminar --------------------------------------------------
  { id: 's.n42', es: 'Empecé a estudiar español hace dos años.', en: 'I started learning Spanish two years ago.', concepts: ['v.empezar'], level: 'A2', topics: ['past', 'university'] },
  { id: 's.n43', es: 'La película empezaba a las diez.', en: 'The film started at ten.', concepts: ['v.empezar'], level: 'B1', topics: ['hobbies', 'past'] },
  { id: 's.n44', es: '¿Ya habéis empezado?', en: 'Have you started yet?', concepts: ['v.empezar'], level: 'A2', topics: ['work'] },
  { id: 's.n45', es: 'Empezaremos por el principio.', en: "We'll start from the beginning.", concepts: ['v.empezar'], level: 'B1', topics: ['work'] },
  { id: 's.n46', es: 'Terminé el trabajo a medianoche.', en: 'I finished the work at midnight.', concepts: ['v.terminar'], level: 'A2', topics: ['work', 'past'] },
  { id: 's.n47', es: 'Cuando termines, avísame.', en: 'When you finish, let me know.', concepts: ['v.terminar'], level: 'B1', topics: ['work'] },
  { id: 's.n48', es: 'Terminábamos siempre sobre las seis.', en: 'We always used to finish around six.', concepts: ['v.terminar'], level: 'B1', topics: ['work', 'past'] },
  { id: 's.n49', es: 'Han terminado la obra por fin.', en: "They've finally finished the building work.", concepts: ['v.terminar'], level: 'B1', topics: ['city'] },

  // --- encontrar -----------------------------------------------------------
  { id: 's.n50', es: 'Encontré el billete en el bolso.', en: 'I found the ticket in my bag.', concepts: ['v.encontrar', 'v.bolso'], level: 'A2', topics: ['past', 'travel'] },
  { id: 's.n51', es: 'No encontrábamos las llaves por ningún sitio.', en: "We couldn't find the keys anywhere.", concepts: ['v.encontrar'], level: 'B1', topics: ['past'] },
  { id: 's.n52', es: '¿Habéis encontrado el sitio sin problema?', en: 'Did you find the place all right?', concepts: ['v.encontrar'], level: 'A2', topics: ['directions'] },
  { id: 's.n53', es: 'Encontraremos una solución entre todos.', en: "We'll find a solution between us.", concepts: ['v.encontrar'], level: 'B1', topics: ['work'] },
  { id: 's.n54', es: 'Espero que encuentres lo que buscas.', en: 'I hope you find what you are looking for.', concepts: ['v.encontrar', 'v.buscar'], level: 'B1', topics: ['social'] },

  // --- dormir --------------------------------------------------------------
  { id: 's.n55', es: 'Anoche dormí sólo cuatro horas.', en: 'Last night I only slept four hours.', concepts: ['v.dormir'], level: 'A2', topics: ['daily-routine', 'past'] },
  { id: 's.n56', es: 'El niño durmió toda la noche.', en: 'The child slept all night.', concepts: ['v.dormir', 'v.nino'], level: 'A2', topics: ['family', 'past'] },
  { id: 's.n57', es: 'De pequeña dormía con la luz encendida.', en: 'As a little girl I slept with the light on.', concepts: ['v.dormir', 'v.luz'], level: 'B1', topics: ['past'] },
  { id: 's.n58', es: '¿Habéis dormido bien?', en: 'Did you sleep well?', concepts: ['v.dormir'], level: 'A2', topics: ['daily-routine'] },
  { id: 's.n59', es: 'Duerme un poco, tienes mala cara.', en: 'Get some sleep, you look awful.', concepts: ['v.dormir', 'v.cara'], level: 'A2', topics: ['health'] },

  // --- doler ---------------------------------------------------------------
  { id: 's.n60', es: 'Me dolió mucho la espalda ese día.', en: 'My back really hurt that day.', concepts: ['v.doler'], level: 'A2', topics: ['health', 'past'] },
  { id: 's.n61', es: 'Me dolía la garganta desde el lunes.', en: 'My throat had been hurting since Monday.', concepts: ['v.doler'], level: 'B1', topics: ['health', 'past'] },
  { id: 's.n62', es: 'Me ha dolido la cabeza todo el día.', en: "My head has hurt all day.", concepts: ['v.doler', 'v.cabeza'], level: 'A2', topics: ['health'] },

  // --- haber ---------------------------------------------------------------
  { id: 's.n63', es: 'Hay dos farmacias en esta calle.', en: 'There are two chemists on this street.', concepts: ['g.hay-estar'], level: 'A1', topics: ['city', 'directions'] },
  { id: 's.n64', es: 'No hay nadie en la oficina.', en: "There's nobody in the office.", concepts: ['g.hay-estar', 'v.oficina'], level: 'A1', topics: ['work'] },
  { id: 's.n65', es: 'Había mucha gente en la plaza.', en: 'There were a lot of people in the square.', concepts: ['g.hay-estar'], level: 'B1', topics: ['city', 'past'] },
  { id: 's.n66', es: 'Habrá tormenta esta tarde.', en: "There'll be a storm this afternoon.", concepts: ['g.hay-estar', 'v.tormenta'], level: 'B1', topics: ['weather'] },
  { id: 's.n67', es: 'No creo que haya problema.', en: "I don't think there'll be a problem.", concepts: ['g.hay-estar'], level: 'B1', topics: ['opinions'] },

  // --- volver --------------------------------------------------------------
  { id: 's.n68', es: 'Vuelvo a casa sobre las ocho.', en: 'I get home around eight.', concepts: ['v.volver'], level: 'A2', topics: ['daily-routine'] },
  { id: 's.n69', es: 'Volvimos muy tarde de la fiesta.', en: 'We got back from the party very late.', concepts: ['v.volver'], level: 'A2', topics: ['social', 'past'] },
  { id: 's.n70', es: 'Volvía todos los veranos al mismo pueblo.', en: 'He went back to the same village every summer.', concepts: ['v.volver'], level: 'B1', topics: ['past', 'storytelling'] },
  { id: 's.n71', es: 'Ha vuelto a llamar tres veces.', en: "He's called again three times.", concepts: ['v.volver'], level: 'B1', topics: ['social'], note: 'Volver a + infinitivo is how Spanish says "do something again".' },
  { id: 's.n72', es: '¿Cuándo volvéis de Sevilla?', en: 'When are you lot back from Seville?', concepts: ['v.volver'], level: 'A2', topics: ['travel'] },

  // --- pensar --------------------------------------------------------------
  { id: 's.n73', es: 'Pienso que tienes razón.', en: 'I think you are right.', concepts: ['v.pensar'], level: 'A2', topics: ['opinions'] },
  { id: 's.n74', es: 'Lo pensé toda la noche.', en: 'I thought about it all night.', concepts: ['v.pensar'], level: 'A2', topics: ['past'] },
  { id: 's.n75', es: 'Pensábamos ir a la playa, pero llovió.', en: 'We were thinking of going to the beach, but it rained.', concepts: ['v.pensar'], level: 'B1', topics: ['plans', 'past'] },
  { id: 's.n76', es: '¿Qué pensáis del nuevo jefe?', en: 'What do you lot think of the new boss?', concepts: ['v.pensar'], level: 'B1', topics: ['work', 'opinions'] },
  { id: 's.n77', es: 'No pienses tanto y decide.', en: "Don't think so much, just decide.", concepts: ['v.pensar'], level: 'B1', topics: ['opinions'] },

  // --- entender ------------------------------------------------------------
  { id: 's.n78', es: 'No entiendo nada de lo que dice.', en: "I don't understand a word he's saying.", concepts: ['v.entender'], level: 'A2', topics: ['social'] },
  { id: 's.n79', es: 'No entendí la pregunta.', en: "I didn't understand the question.", concepts: ['v.entender'], level: 'A2', topics: ['university', 'past'] },
  { id: 's.n80', es: 'Antes no entendía nada y ahora me defiendo.', en: 'I used to understand nothing and now I get by.', concepts: ['v.entender'], level: 'B1', topics: ['past', 'university'] },
  { id: 's.n81', es: '¿Lo habéis entendido todos?', en: 'Have you all understood?', concepts: ['v.entender'], level: 'B1', topics: ['university'] },

  // --- perder --------------------------------------------------------------
  { id: 's.n82', es: 'Siempre pierdo el paraguas.', en: 'I always lose my umbrella.', concepts: ['v.perder'], level: 'A2', topics: ['daily-routine'] },
  { id: 's.n83', es: 'Perdí el tren por dos minutos.', en: 'I missed the train by two minutes.', concepts: ['v.perder', 'v.minuto'], level: 'A2', topics: ['transport', 'past'] },
  { id: 's.n84', es: 'Hemos perdido el avión.', en: "We've missed the plane.", concepts: ['v.perder', 'v.avion'], level: 'A2', topics: ['travel'] },
  { id: 's.n85', es: 'No perdáis la calma.', en: "Don't lose your cool.", concepts: ['v.perder'], level: 'B1', topics: ['feelings'] },

  // --- jugar ---------------------------------------------------------------
  { id: 's.n86', es: 'Jugamos al fútbol los jueves.', en: 'We play football on Thursdays.', concepts: ['v.jugar'], level: 'A2', topics: ['hobbies'] },
  { id: 's.n87', es: 'Jugué al tenis de pequeño.', en: 'I played tennis as a child.', concepts: ['v.jugar'], level: 'A2', topics: ['hobbies', 'past'] },
  { id: 's.n88', es: 'Los niños jugaban en el jardín.', en: 'The children were playing in the garden.', concepts: ['v.jugar', 'v.nino', 'v.jardin'], level: 'B1', topics: ['past', 'family'] },
  { id: 's.n89', es: '¿Jugáis vosotros esta tarde?', en: 'Are you lot playing this afternoon?', concepts: ['v.jugar'], level: 'A2', topics: ['hobbies'] },

  // --- sentir --------------------------------------------------------------
  { id: 's.n90', es: 'Lo siento mucho, de verdad.', en: "I'm really sorry, honestly.", concepts: ['v.sentir'], level: 'A2', topics: ['social'] },
  { id: 's.n91', es: 'Sintió que algo iba mal.', en: 'He felt that something was wrong.', concepts: ['v.sentir'], level: 'B1', topics: ['feelings', 'storytelling'] },
  { id: 's.n92', es: 'Me sentía fatal aquella mañana.', en: 'I felt terrible that morning.', concepts: ['v.sentir'], level: 'B1', topics: ['feelings', 'past'] },
  { id: 's.n93', es: 'Siento que no podáis venir.', en: "I'm sorry you can't come.", concepts: ['v.sentir'], level: 'B1', topics: ['social'] },

  // --- contar / recordar / olvidar -----------------------------------------
  { id: 's.n94', es: 'Cuéntame qué pasó.', en: 'Tell me what happened.', concepts: ['v.contar', 'v.pasar'], level: 'A2', topics: ['storytelling'] },
  { id: 's.n95', es: 'Nos contó toda la historia.', en: 'He told us the whole story.', concepts: ['v.contar'], level: 'B1', topics: ['storytelling', 'past'] },
  { id: 's.n96', es: 'Mi abuela nos contaba cuentos.', en: 'My grandmother used to tell us stories.', concepts: ['v.contar'], level: 'B1', topics: ['past', 'family'] },
  { id: 's.n97', es: 'No recuerdo su nombre.', en: "I can't remember his name.", concepts: ['v.recordar', 'v.nombre'], level: 'A2', topics: ['people'] },
  { id: 's.n98', es: 'Recordé la contraseña en el último momento.', en: 'I remembered the password at the last moment.', concepts: ['v.recordar'], level: 'B1', topics: ['past'] },
  { id: 's.n99', es: 'Se me ha olvidado tu cumpleaños otra vez.', en: "I've forgotten your birthday again.", concepts: ['v.olvidar'], level: 'A2', topics: ['daily-routine', 'social'] },
  { id: 's.n100', es: 'Olvidé por completo la cita.', en: 'I completely forgot the appointment.', concepts: ['v.olvidar'], level: 'B1', topics: ['past'] },
  { id: 's.n101', es: 'No olvidéis los billetes.', en: "Don't forget the tickets.", concepts: ['v.olvidar'], level: 'B1', topics: ['travel'] },

  // --- dejar / cambiar / ganar / intentar ----------------------------------
  { id: 's.n102', es: 'Deja el abrigo en la silla.', en: 'Leave your coat on the chair.', concepts: ['v.dejar', 'v.abrigo', 'v.silla'], level: 'A2', topics: ['home'] },
  { id: 's.n103', es: 'Dejé el trabajo el año pasado.', en: 'I left my job last year.', concepts: ['v.dejar'], level: 'B1', topics: ['work', 'past'] },
  { id: 's.n104', es: 'He dejado de fumar.', en: "I've stopped smoking.", concepts: ['v.dejar'], level: 'B1', topics: ['health'] },
  { id: 's.n105', es: 'Cambiamos de piso el mes pasado.', en: 'We moved flat last month.', concepts: ['v.cambiar'], level: 'B1', topics: ['home', 'past'] },
  { id: 's.n106', es: 'Las cosas han cambiado mucho.', en: 'Things have changed a lot.', concepts: ['v.cambiar'], level: 'B1', topics: ['opinions'] },
  { id: 's.n107', es: 'Ganamos el partido por dos goles.', en: 'We won the match by two goals.', concepts: ['v.ganar'], level: 'B1', topics: ['hobbies', 'past'] },
  { id: 's.n108', es: 'Gana bastante bien en esa empresa.', en: 'She earns pretty well at that company.', concepts: ['v.ganar'], level: 'B1', topics: ['work'] },
  { id: 's.n109', es: 'Voy a intentar llegar a tiempo.', en: "I'm going to try to get there on time.", concepts: ['v.intentar', 'v.llegar'], level: 'B1', topics: ['plans'] },
  { id: 's.n110', es: 'Lo intenté varias veces.', en: 'I tried several times.', concepts: ['v.intentar'], level: 'B1', topics: ['past'] },
  { id: 's.n111', es: 'Intentad no hacer ruido.', en: 'Try not to make any noise.', concepts: ['v.intentar'], level: 'B1', topics: ['social'] },

  // --- parecer / creer -----------------------------------------------------
  { id: 's.n112', es: 'Me parece que se ha equivocado.', en: 'I think he has made a mistake.', concepts: ['v.parecer'], level: 'B1', topics: ['opinions'] },
  { id: 's.n113', es: 'Parecía más joven en las fotos.', en: 'She looked younger in the photos.', concepts: ['v.parecer'], level: 'B1', topics: ['describing', 'past'] },
  { id: 's.n114', es: '¿Qué os parece la idea?', en: 'What do you lot think of the idea?', concepts: ['v.parecer'], level: 'B1', topics: ['opinions'] },
  { id: 's.n115', es: 'No me parece que sea justo.', en: "I don't think it's fair.", concepts: ['v.parecer'], level: 'B2', topics: ['opinions'] },
  { id: 's.n116', es: 'Creo que va a llover.', en: 'I think it is going to rain.', concepts: ['v.creer'], level: 'B1', topics: ['weather', 'opinions'] },
  { id: 's.n117', es: 'Nadie creyó su versión.', en: 'Nobody believed his version.', concepts: ['v.creer'], level: 'B1', topics: ['storytelling', 'past'] },
  { id: 's.n118', es: 'No creo que sea buena idea.', en: "I don't think it's a good idea.", concepts: ['v.creer'], level: 'B1', topics: ['opinions'], note: 'No creer que triggers the subjunctive; creer que does not.' },
  { id: 's.n119', es: 'Antes creía todo lo que leía.', en: 'I used to believe everything I read.', concepts: ['v.creer'], level: 'B1', topics: ['past', 'opinions'] },

  // --- conseguir / servir --------------------------------------------------
  { id: 's.n120', es: 'Al final conseguí entrar.', en: 'In the end I managed to get in.', concepts: ['v.conseguir'], level: 'B1', topics: ['past'] },
  { id: 's.n121', es: 'No consigo abrir este bote.', en: "I can't get this jar open.", concepts: ['v.conseguir', 'v.abrir'], level: 'B1', topics: ['home'] },
  { id: 's.n122', es: 'Consiguió el trabajo sin experiencia.', en: 'She got the job with no experience.', concepts: ['v.conseguir'], level: 'B1', topics: ['work', 'past'] },
  { id: 's.n123', es: 'Espero que consigáis lo que queréis.', en: 'I hope you get what you want.', concepts: ['v.conseguir'], level: 'B2', topics: ['social'] },
  { id: 's.n124', es: 'Este mando no sirve para nada.', en: 'This remote is completely useless.', concepts: ['v.servir'], level: 'B1', topics: ['home'] },
  { id: 's.n125', es: 'Sirvieron la cena a las diez.', en: 'They served dinner at ten.', concepts: ['v.servir'], level: 'B1', topics: ['restaurant', 'past'] },
  { id: 's.n126', es: '¿Para qué sirve esto?', en: "What's this for?", concepts: ['v.servir'], level: 'B1', topics: ['opinions'] },

  // --- mover / crecer / nacer / morir / caer -------------------------------
  { id: 's.n127', es: 'Movimos el sofá al otro lado.', en: 'We moved the sofa to the other side.', concepts: ['v.mover', 'v.sofa'], level: 'B1', topics: ['home', 'past'] },
  { id: 's.n128', es: 'No muevas nada de sitio.', en: "Don't move anything.", concepts: ['v.mover'], level: 'B1', topics: ['home'] },
  { id: 's.n129', es: 'Los niños crecen muy rápido.', en: 'Children grow up very fast.', concepts: ['v.crecer', 'v.nino'], level: 'B1', topics: ['family'] },
  { id: 's.n130', es: 'Crecí en un pueblo de la sierra.', en: 'I grew up in a village in the mountains.', concepts: ['v.crecer'], level: 'B1', topics: ['past', 'storytelling'] },
  { id: 's.n131', es: 'Nací en Liubliana.', en: 'I was born in Ljubljana.', concepts: ['v.nacer'], level: 'B1', topics: ['introductions', 'past'] },
  { id: 's.n132', es: 'Mi abuelo nació antes de la guerra.', en: 'My grandfather was born before the war.', concepts: ['v.nacer'], level: 'B1', topics: ['family', 'past'] },
  { id: 's.n133', es: 'Su padre murió el año pasado.', en: 'Her father died last year.', concepts: ['v.morir'], level: 'B1', topics: ['family', 'past'] },
  { id: 's.n134', es: 'Se me ha caído el móvil.', en: "I've dropped my phone.", concepts: ['v.caer'], level: 'B1', topics: ['daily-routine'] },
  { id: 's.n135', es: 'Tu hermano me cae muy bien.', en: 'I really like your brother.', concepts: ['v.caer'], level: 'B1', topics: ['people'], note: 'Caer bien is how Spanish says you like a person — gustar would sound romantic.' },
  { id: 's.n136', es: 'Se cayó por las escaleras.', en: 'He fell down the stairs.', concepts: ['v.caer'], level: 'B1', topics: ['past'] },

  // --- ocurrir -------------------------------------------------------------
  { id: 's.n137', es: 'Se me ocurre una idea mejor.', en: 'I have a better idea.', concepts: ['v.ocurrir'], level: 'B1', topics: ['opinions'] },
  { id: 's.n138', es: 'Todo ocurrió muy deprisa.', en: 'It all happened very fast.', concepts: ['v.ocurrir'], level: 'B1', topics: ['storytelling', 'past'] },
  { id: 's.n139', es: 'No se me ocurrió preguntarle.', en: 'It did not occur to me to ask him.', concepts: ['v.ocurrir'], level: 'B2', topics: ['past'] },

  // --- B2: argument and abstraction ----------------------------------------
  { id: 's.n140', es: 'Supongo que tendrás razón.', en: "I suppose you'll be right.", concepts: ['v.suponer'], level: 'B2', topics: ['opinions'] },
  { id: 's.n141', es: 'Eso supuso un cambio importante.', en: 'That meant a significant change.', concepts: ['v.suponer', 'v.cambiar'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.n142', es: 'Suponía que ya lo sabíais.', en: 'I assumed you already knew.', concepts: ['v.suponer'], level: 'B2', topics: ['opinions', 'past'] },
  { id: 's.n143', es: 'Mantengo lo que dije ayer.', en: 'I stand by what I said yesterday.', concepts: ['v.mantener'], level: 'B2', topics: ['opinions'] },
  { id: 's.n144', es: 'Mantuvieron la calma en todo momento.', en: 'They kept calm throughout.', concepts: ['v.mantener'], level: 'B2', topics: ['feelings', 'past'] },
  { id: 's.n145', es: 'Habrá que mantener el ritmo.', en: "We'll have to keep up the pace.", concepts: ['v.mantener'], level: 'B2', topics: ['work'] },
  { id: 's.n146', es: 'La ley establece unos límites claros.', en: 'The law sets out clear limits.', concepts: ['v.establecer'], level: 'B2', topics: ['opinions'] },
  { id: 's.n147', es: 'Establecieron el plazo en dos semanas.', en: 'They set the deadline at two weeks.', concepts: ['v.establecer'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.n148', es: 'No permiten fumar en la terraza.', en: 'They do not allow smoking on the terrace.', concepts: ['v.permitir'], level: 'B2', topics: ['city'] },
  { id: 's.n149', es: 'El ruido me impidió dormir.', en: 'The noise stopped me sleeping.', concepts: ['v.impedir', 'v.dormir'], level: 'B2', topics: ['home', 'past'] },
  { id: 's.n150', es: 'Nada impide que lo intentemos.', en: 'Nothing stops us trying.', concepts: ['v.impedir', 'v.intentar'], level: 'B2', topics: ['opinions'] },
  { id: 's.n151', es: '¿Qué sucedió exactamente?', en: 'What exactly happened?', concepts: ['v.suceder'], level: 'B2', topics: ['storytelling', 'past'] },
  { id: 's.n152', es: 'Sucede lo mismo todos los años.', en: 'The same thing happens every year.', concepts: ['v.suceder'], level: 'B2', topics: ['opinions'] },
  { id: 's.n153', es: 'Resulta que ya lo sabían.', en: 'It turns out they already knew.', concepts: ['v.resultar'], level: 'B2', topics: ['storytelling'] },
  { id: 's.n154', es: 'La reunión resultó bastante tensa.', en: 'The meeting turned out rather tense.', concepts: ['v.resultar'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.n155', es: 'Resultaría más barato ir en tren.', en: 'It would work out cheaper to go by train.', concepts: ['v.resultar'], level: 'B2', topics: ['travel'] },

  // --- The present perfect, across the rest of the new verbs ---------------
  /**
   * Spain reaches for the present perfect where much of Latin America uses the
   * preterite — hoy he comido, not hoy comí — so it is not an advanced tense
   * here, it is the everyday past. Each of these exists because its paradigm
   * had no sentence carrying a form of it, which leaves it table-only.
   */
  { id: 's.n156', es: 'He necesitado tu ayuda más de una vez.', en: "I've needed your help more than once.", concepts: ['v.necesitar'], level: 'A2', topics: ['social'] },
  { id: 's.n157', es: 'Nos has ayudado muchísimo.', en: "You've helped us enormously.", concepts: ['v.ayudar'], level: 'A2', topics: ['social'] },
  { id: 's.n158', es: 'He pensado en lo que dijiste.', en: "I've thought about what you said.", concepts: ['v.pensar'], level: 'B1', topics: ['opinions'] },
  { id: 's.n159', es: 'Nunca he sentido algo así.', en: "I've never felt anything like it.", concepts: ['v.sentir'], level: 'B1', topics: ['feelings'] },
  { id: 's.n160', es: '¿Has recordado traer el cargador?', en: 'Did you remember to bring the charger?', concepts: ['v.recordar'], level: 'B1', topics: ['daily-routine'] },
  { id: 's.n161', es: 'Hemos ganado dos partidos seguidos.', en: "We've won two matches in a row.", concepts: ['v.ganar'], level: 'B1', topics: ['hobbies'] },
  { id: 's.n162', es: 'Lo he intentado todo.', en: "I've tried everything.", concepts: ['v.intentar'], level: 'B1', topics: ['work'] },
  { id: 's.n163', es: 'Siempre me ha parecido buena persona.', en: "He's always seemed a good person to me.", concepts: ['v.parecer'], level: 'B1', topics: ['people'] },
  { id: 's.n164', es: 'Nunca he creído esas historias.', en: "I've never believed those stories.", concepts: ['v.creer'], level: 'B1', topics: ['opinions'] },
  { id: 's.n165', es: 'Hemos conseguido las entradas.', en: "We've got the tickets.", concepts: ['v.conseguir'], level: 'B1', topics: ['hobbies'] },
  { id: 's.n166', es: 'Ese consejo me ha servido mucho.', en: "That advice has been really useful to me.", concepts: ['v.servir'], level: 'B1', topics: ['opinions'] },
  { id: 's.n167', es: '¿Habéis movido el armario vosotros solos?', en: 'Did you two move the wardrobe on your own?', concepts: ['v.mover'], level: 'B1', topics: ['home'] },
  { id: 's.n168', es: 'La ciudad ha crecido mucho estos años.', en: 'The city has grown a lot in recent years.', concepts: ['v.crecer'], level: 'B1', topics: ['city'] },
  { id: 's.n169', es: 'Ha nacido su primer hijo.', en: 'Their first child has been born.', concepts: ['v.nacer'], level: 'B1', topics: ['family'] },
  { id: 's.n170', es: 'Han muerto muchas costumbres antiguas.', en: 'Many old customs have died out.', concepts: ['v.morir'], level: 'B2', topics: ['opinions'] },
  { id: 's.n171', es: 'No ha ocurrido nada grave.', en: 'Nothing serious has happened.', concepts: ['v.ocurrir'], level: 'B1', topics: ['storytelling'] },
  { id: 's.n172', es: 'Siempre he supuesto que estabais de acuerdo.', en: "I've always assumed you agreed.", concepts: ['v.suponer'], level: 'B2', topics: ['opinions'] },
  { id: 's.n173', es: 'Hemos mantenido el contacto todos estos años.', en: "We've kept in touch all these years.", concepts: ['v.mantener'], level: 'B2', topics: ['social'] },
  { id: 's.n174', es: 'Han establecido nuevas condiciones.', en: "They've set new conditions.", concepts: ['v.establecer'], level: 'B2', topics: ['work'] },
  { id: 's.n175', es: 'Nunca me han permitido entrar ahí.', en: "They've never let me in there.", concepts: ['v.permitir'], level: 'B2', topics: ['city'] },
  { id: 's.n176', es: 'La lluvia nos ha impedido salir.', en: 'The rain has stopped us going out.', concepts: ['v.impedir', 'v.lluvia'], level: 'B2', topics: ['weather'] },
  { id: 's.n177', es: 'Ha sucedido algo que no esperábamos.', en: 'Something we were not expecting has happened.', concepts: ['v.suceder'], level: 'B2', topics: ['storytelling'] },
  { id: 's.n178', es: 'Todo ha resultado mejor de lo previsto.', en: 'Everything has turned out better than expected.', concepts: ['v.resultar'], level: 'B2', topics: ['opinions'] },
  { id: 's.n179', es: 'Las dos reuniones han resultado inútiles.', en: 'Both meetings have proved pointless.', concepts: ['v.resultar'], level: 'B2', topics: ['work'] },
  { id: 's.n180', es: 'Hemos resultado ser los únicos interesados.', en: "We've turned out to be the only ones interested.", concepts: ['v.resultar'], level: 'B2', topics: ['work'] },

  // --- Closing the last corpus gaps ---------------------------------------
  /**
   * Written against `reportVerbCorpus`, which listed 47 paradigms — mostly
   * imperfects and conditionals — with no sentence carrying any of their forms.
   * Each line here exists to make one or two of those practisable in a sentence
   * rather than only from a table.
   */
  { id: 's.n181', es: 'Antes perdía el autobús casi todos los días.', en: 'I used to miss the bus almost every day.', concepts: ['v.perder'], level: 'B1', topics: ['transport', 'past'] },
  { id: 's.n182', es: 'De pequeño recordaba todos los nombres.', en: 'As a child I remembered everyone\u2019s name.', concepts: ['v.recordar', 'v.nombre'], level: 'B1', topics: ['past'] },
  { id: 's.n183', es: 'Siempre olvidaba las llaves dentro de casa.', en: 'She was always leaving her keys inside the house.', concepts: ['v.olvidar'], level: 'B1', topics: ['past', 'home'] },
  { id: 's.n184', es: 'Dejaba el coche en la plaza todas las mañanas.', en: 'He used to leave the car in the square every morning.', concepts: ['v.dejar'], level: 'B1', topics: ['past', 'transport'] },
  { id: 's.n185', es: 'El barrio cambiaba muy deprisa en aquellos años.', en: 'The neighbourhood was changing very fast in those years.', concepts: ['v.cambiar', 'v.barrio'], level: 'B1', topics: ['city', 'past'] },
  { id: 's.n186', es: 'Ganaba poco, pero vivía tranquilo.', en: 'He earned little, but he lived peacefully.', concepts: ['v.ganar'], level: 'B1', topics: ['work', 'past'] },
  { id: 's.n187', es: 'Lo intentaba una y otra vez sin quejarse.', en: 'She kept trying over and over without complaining.', concepts: ['v.intentar'], level: 'B1', topics: ['past'] },
  { id: 's.n188', es: 'Nunca conseguía llegar a tiempo.', en: 'He never managed to arrive on time.', concepts: ['v.conseguir', 'v.llegar'], level: 'B1', topics: ['past'] },
  { id: 's.n189', es: 'Ese bar servía las mejores tapas del barrio.', en: 'That bar served the best tapas in the neighbourhood.', concepts: ['v.servir', 'v.bar'], level: 'B1', topics: ['restaurant', 'past'] },
  { id: 's.n190', es: 'El armario no se movía por mucho que empujáramos.', en: 'The wardrobe would not move however hard we pushed.', concepts: ['v.mover'], level: 'B2', topics: ['home', 'past'] },
  { id: 's.n191', es: 'El pueblo crecía cada verano con los turistas.', en: 'The village grew every summer with the tourists.', concepts: ['v.crecer', 'v.pueblo', 'v.turista'], level: 'B1', topics: ['city', 'past'] },
  { id: 's.n192', es: 'En aquella época nacía menos gente en el pueblo.', en: 'At that time fewer people were born in the village.', concepts: ['v.nacer', 'v.pueblo'], level: 'B2', topics: ['past'] },
  { id: 's.n193', es: 'La planta se moría poco a poco.', en: 'The plant was slowly dying.', concepts: ['v.morir'], level: 'B1', topics: ['home', 'past'] },
  { id: 's.n194', es: 'Se le caía todo de las manos.', en: 'He kept dropping everything.', concepts: ['v.caer', 'v.mano'], level: 'B1', topics: ['past'] },
  { id: 's.n195', es: 'Aquello ocurría casi todas las semanas.', en: 'That happened almost every week.', concepts: ['v.ocurrir'], level: 'B1', topics: ['past', 'storytelling'] },
  { id: 's.n196', es: 'Mantenía la calma incluso cuando todo iba mal.', en: 'She kept calm even when everything was going wrong.', concepts: ['v.mantener'], level: 'B2', topics: ['feelings', 'past'] },
  { id: 's.n197', es: 'La empresa establecía sus propias normas.', en: 'The company set its own rules.', concepts: ['v.establecer'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.n198', es: 'Antes no permitían perros en la terraza.', en: 'They used to not allow dogs on the terrace.', concepts: ['v.permitir'], level: 'B2', topics: ['city', 'past'] },
  { id: 's.n199', es: 'El ruido nos impedía concentrarnos.', en: 'The noise stopped us concentrating.', concepts: ['v.impedir'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.n200', es: 'Sucedía lo mismo cada invierno.', en: 'The same thing happened every winter.', concepts: ['v.suceder'], level: 'B2', topics: ['past'] },
  { id: 's.n201', es: 'Todo resultaba más sencillo entonces.', en: 'Everything seemed simpler back then.', concepts: ['v.resultar'], level: 'B2', topics: ['past', 'opinions'] },
  { id: 's.n228', es: 'Aquellas reuniones resultaban interminables.', en: 'Those meetings were endless.', concepts: ['v.resultar'], level: 'B2', topics: ['work', 'past'] },

  { id: 's.n202', es: 'Yo pasaría por casa antes de ir.', en: 'I would go by home before going.', concepts: ['v.pasar'], level: 'B1', topics: ['plans'] },
  { id: 's.n203', es: 'Así no encontraríamos nada.', en: 'We would not find anything that way.', concepts: ['v.encontrar'], level: 'B1', topics: ['opinions'] },
  { id: 's.n204', es: 'Te dolería menos con hielo.', en: 'It would hurt you less with ice.', concepts: ['v.doler'], level: 'B1', topics: ['health'] },
  { id: 's.n205', es: 'Yo lo sentiría muchísimo.', en: 'I would be really sorry about it.', concepts: ['v.sentir'], level: 'B1', topics: ['feelings'] },
  { id: 's.n206', es: 'No lo recordarías ni queriendo.', en: 'You would not remember it even if you tried.', concepts: ['v.recordar'], level: 'B2', topics: ['opinions'] },
  { id: 's.n207', es: 'Cualquiera lo olvidaría con tanto lío.', en: 'Anyone would forget it with so much going on.', concepts: ['v.olvidar'], level: 'B2', topics: ['opinions'] },
  { id: 's.n208', es: 'Con ese sueldo ganaríamos bastante más.', en: 'On that salary we would earn quite a bit more.', concepts: ['v.ganar'], level: 'B2', topics: ['work'] },
  { id: 's.n209', es: 'La planta crecería mejor al sol.', en: 'The plant would grow better in the sun.', concepts: ['v.crecer'], level: 'B2', topics: ['home'] },
  { id: 's.n210', es: 'El niño nacería en primavera.', en: 'The baby would be born in spring.', concepts: ['v.nacer', 'v.nino'], level: 'B2', topics: ['family'] },
  { id: 's.n211', es: 'Sin agua se moriría en dos días.', en: 'Without water it would die in two days.', concepts: ['v.morir'], level: 'B2', topics: ['home'] },
  { id: 's.n212', es: 'Se caería seguro con ese viento.', en: 'It would definitely fall in that wind.', concepts: ['v.caer'], level: 'B2', topics: ['weather'] },
  { id: 's.n213', es: 'Eso ocurriría de todas formas.', en: 'That would happen anyway.', concepts: ['v.ocurrir'], level: 'B2', topics: ['opinions'] },
  { id: 's.n214', es: 'Estableceríamos un límite razonable.', en: 'We would set a reasonable limit.', concepts: ['v.establecer'], level: 'B2', topics: ['work'] },
  { id: 's.n215', es: 'No permitiría algo así en mi casa.', en: 'I would not allow something like that in my house.', concepts: ['v.permitir'], level: 'B2', topics: ['home', 'opinions'] },
  { id: 's.n216', es: 'Nada impediría que volviéramos.', en: 'Nothing would stop us coming back.', concepts: ['v.impedir', 'v.volver'], level: 'B2', topics: ['plans'] },
  { id: 's.n217', es: 'Sucedería lo mismo en cualquier sitio.', en: 'The same thing would happen anywhere.', concepts: ['v.suceder'], level: 'B2', topics: ['opinions'] },

  { id: 's.n218', es: 'Lo sentirás cuando pase el efecto.', en: 'You will feel it when the effect wears off.', concepts: ['v.sentir'], level: 'B2', topics: ['health'] },
  { id: 's.n219', es: 'Dejaré las llaves en el buzón.', en: 'I will leave the keys in the letterbox.', concepts: ['v.dejar'], level: 'B1', topics: ['home'] },
  { id: 's.n220', es: 'Intento no llegar tarde nunca.', en: 'I try never to be late.', concepts: ['v.intentar', 'v.llegar'], level: 'B1', topics: ['daily-routine'] },
  { id: 's.n221', es: 'Muevo la mesa y ya cabemos todos.', en: 'I will move the table and then we all fit.', concepts: ['v.mover'], level: 'B1', topics: ['home'] },
  { id: 's.n222', es: 'Cada año nacen menos niños aquí.', en: 'Fewer children are born here every year.', concepts: ['v.nacer', 'v.nino'], level: 'B1', topics: ['city'] },
  { id: 's.n223', es: 'Se muere de ganas de contártelo.', en: 'She is dying to tell you.', concepts: ['v.morir', 'v.contar'], level: 'B2', topics: ['feelings'] },
  { id: 's.n224', es: 'Me pareció un poco raro todo aquello.', en: 'The whole thing seemed a bit odd to me.', concepts: ['v.parecer'], level: 'B1', topics: ['opinions', 'past'] },
  { id: 's.n225', es: 'No nos permitió pasar sin entrada.', en: 'He did not let us in without a ticket.', concepts: ['v.permitir', 'v.pasar'], level: 'B2', topics: ['city', 'past'] },
  { id: 's.n226', es: 'No creo que crea una palabra.', en: 'I do not think he believes a word.', concepts: ['v.creer'], level: 'B2', topics: ['opinions'] },
  { id: 's.n227', es: 'Ojalá nada impida que vengáis.', en: 'I hope nothing stops you coming.', concepts: ['v.impedir'], level: 'B2', topics: ['social'] },
];
