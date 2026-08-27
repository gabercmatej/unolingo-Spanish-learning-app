import type { Sentence } from '@/content/types';

/**
 * A second sentence for every paradigm that had exactly one.
 *
 * `audit:content` reported 188 taught paradigms resting on a single sentence.
 * That is not the dead state — the paradigm is reachable, and the generator can
 * build from it — but it is the state where every exercise about a conjugation
 * is the same line under a different heading. A learner sees "Llegaba tarde a
 * todo" as a gap-fill, then as a dictation, then as a word bank, and learns the
 * sentence rather than the tense.
 *
 * Written to carry **two or three verbs of the same tense apiece**, which is
 * both efficient and truer to the language: Spanish chains verbs in a shared
 * tense constantly, and a corpus of one-verb sentences quietly teaches a
 * learner that it does not.
 */
export const verbDepthSentences: Sentence[] = [
  // --- Preterite -----------------------------------------------------------
  { id: 's.v1', es: 'Hubo un apagón y nadie encontró las velas.', en: 'There was a power cut and nobody found the candles.', concepts: ['v.encontrar'], level: 'B1', topics: ['home', 'past'] },
  { id: 's.v2', es: 'Abrió la puerta, pensó un momento y no dijo nada.', en: 'She opened the door, thought for a moment and said nothing.', concepts: ['v.abrir', 'v.pensar', 'v.puerta'], level: 'B1', topics: ['storytelling', 'past'] },
  { id: 's.v3', es: 'Me dolió la espalda toda la semana y no entendí por qué.', en: 'My back hurt all week and I did not understand why.', concepts: ['v.doler', 'v.entender'], level: 'B1', topics: ['health', 'past'] },
  { id: 's.v4', es: 'Sintió que algo iba mal y recordó la llamada de la mañana.', en: 'He felt something was wrong and remembered the morning’s call.', concepts: ['v.sentir', 'v.recordar'], level: 'B1', topics: ['storytelling', 'past'] },
  { id: 's.v5', es: 'Ganó el partido, pero pareció más difícil de lo que fue.', en: 'She won the match, but it looked harder than it was.', concepts: ['v.ganar', 'v.parecer'], level: 'B1', topics: ['hobbies', 'past'] },
  { id: 's.v6', es: 'Nadie movió un dedo y el problema creció solo.', en: 'Nobody lifted a finger and the problem grew on its own.', concepts: ['v.mover', 'v.crecer', 'v.dedo'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.v7', es: 'El árbol murió el invierno en que cayó la nieve tardía.', en: 'The tree died the winter the late snow fell.', concepts: ['v.morir', 'v.caer', 'v.nieve'], level: 'B2', topics: ['weather', 'past'] },
  { id: 's.v8', es: 'Supuso que estábamos de acuerdo y estableció la fecha él solo.', en: 'He assumed we agreed and set the date on his own.', concepts: ['v.suponer', 'v.establecer'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.v9', es: 'No permitió que entráramos y eso impidió cualquier acuerdo.', en: 'He did not let us in, and that prevented any agreement.', concepts: ['v.permitir', 'v.impedir'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.v10', es: 'Todo sucedió muy rápido y nadie lo entendió del todo.', en: 'It all happened very fast and nobody entirely understood it.', concepts: ['v.suceder', 'v.entender'], level: 'B2', topics: ['storytelling', 'past'] },

  // --- Imperfect -----------------------------------------------------------
  { id: 's.v11', es: 'Llegaba a las ocho y necesitaba dos cafés antes de hablar.', en: 'He used to arrive at eight and needed two coffees before speaking.', concepts: ['v.llegar', 'v.necesitar'], level: 'B1', topics: ['work', 'past'] },
  { id: 's.v12', es: 'Nos ayudaba con la mudanza mientras buscaba piso él mismo.', en: 'He helped us with the move while looking for a flat himself.', concepts: ['v.ayudar', 'v.buscar'], level: 'B1', topics: ['home', 'past'] },
  { id: 's.v13', es: 'Abría a las nueve y cerraba a las dos, como todo el barrio.', en: 'It opened at nine and closed at two, like the whole neighbourhood.', concepts: ['v.abrir', 'v.cerrar', 'v.barrio'], level: 'B1', topics: ['shopping', 'past'] },
  { id: 's.v14', es: 'Empezaba pronto y terminaba tardísimo.', en: 'She started early and finished terribly late.', concepts: ['v.empezar', 'v.terminar'], level: 'B1', topics: ['work', 'past'] },
  { id: 's.v15', es: 'No encontraba las llaves y dormía fatal por eso.', en: 'She could not find her keys and slept terribly because of it.', concepts: ['v.encontrar', 'v.dormir'], level: 'B1', topics: ['home', 'past'] },
  { id: 's.v16', es: 'Me dolía la rodilla y volvía andando de todas formas.', en: 'My knee hurt and I walked back anyway.', concepts: ['v.doler', 'v.volver', 'v.rodilla'], level: 'B1', topics: ['health', 'past'] },
  { id: 's.v17', es: 'Perdía el autobús a menudo y jugaba al fútbol los jueves.', en: 'He often missed the bus and played football on Thursdays.', concepts: ['v.perder', 'v.jugar'], level: 'B1', topics: ['past', 'hobbies'] },
  { id: 's.v18', es: 'Se sentía mal y contaba lo mismo una y otra vez.', en: 'He felt unwell and told the same story over and over.', concepts: ['v.sentir', 'v.contar'], level: 'B1', topics: ['past', 'health'] },
  { id: 's.v19', es: 'Recordaba las caras y olvidaba los nombres.', en: 'She remembered faces and forgot names.', concepts: ['v.recordar', 'v.olvidar', 'v.nombre'], level: 'B1', topics: ['people', 'past'] },
  { id: 's.v20', es: 'Dejaba la bici en el portal y cambiaba de ruta cada día.', en: 'He left his bike in the doorway and changed route every day.', concepts: ['v.dejar', 'v.cambiar', 'v.bici'], level: 'B1', topics: ['transport', 'past'] },
  { id: 's.v21', es: 'Ganaba poco e intentaba ahorrar igual.', en: 'She earned little and tried to save anyway.', concepts: ['v.ganar', 'v.intentar'], level: 'B1', topics: ['work', 'past'] },
  { id: 's.v22', es: 'Parecía tranquilo, pero yo no creía una palabra.', en: 'He seemed calm, but I did not believe a word.', concepts: ['v.parecer', 'v.creer'], level: 'B1', topics: ['opinions', 'past'] },
  { id: 's.v23', es: 'No conseguía dormir y servía cafés a las seis de la mañana.', en: 'She could not sleep and was serving coffees at six in the morning.', concepts: ['v.conseguir', 'v.servir'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.v24', es: 'Nada se movía y la hierba crecía por todas partes.', en: 'Nothing moved and the grass grew everywhere.', concepts: ['v.mover', 'v.crecer'], level: 'B2', topics: ['past'] },
  { id: 's.v25', es: 'Allí nacía poca gente y se moría mucha.', en: 'Few people were born there and many died.', concepts: ['v.nacer', 'v.morir'], level: 'B2', topics: ['past'] },
  { id: 's.v26', es: 'Se le caía todo y aquello ocurría cada semana.', en: 'He dropped everything, and that happened every week.', concepts: ['v.caer', 'v.ocurrir'], level: 'B2', topics: ['past'] },
  { id: 's.v27', es: 'Suponía demasiado y mantenía la misma postura siempre.', en: 'He assumed too much and always kept the same position.', concepts: ['v.suponer', 'v.mantener'], level: 'B2', topics: ['opinions', 'past'] },
  { id: 's.v28', es: 'La norma establecía un límite que nadie permitía saltarse.', en: 'The rule set a limit nobody allowed you to break.', concepts: ['v.establecer', 'v.permitir'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.v29', es: 'El humo impedía ver y todo resultaba más lento.', en: 'The smoke made it impossible to see and everything was slower.', concepts: ['v.impedir', 'v.resultar'], level: 'B2', topics: ['past'] },
  { id: 's.v30', es: 'Sucedía siempre igual y nadie lo cambiaba.', en: 'It always happened the same way and nobody changed it.', concepts: ['v.suceder', 'v.cambiar'], level: 'B2', topics: ['past'] },

  // --- Future --------------------------------------------------------------
  { id: 's.v31', es: 'Pasaré por tu casa y esperaré abajo.', en: 'I will come by your place and wait downstairs.', concepts: ['v.pasar', 'v.esperar', 'v.abajo'], level: 'B1', topics: ['plans'] },
  { id: 's.v32', es: 'Te ayudaré si cerraré antes, aunque lo dudo.', en: 'I will help you if I finish early, though I doubt it.', concepts: ['v.ayudar', 'v.cerrar'], level: 'B1', topics: ['social'] },
  { id: 's.v33', es: 'Terminaremos a las seis y dormiremos en el tren.', en: 'We will finish at six and sleep on the train.', concepts: ['v.terminar', 'v.dormir'], level: 'B1', topics: ['travel'] },
  { id: 's.v34', es: 'Te dolerá mañana, ya lo pensarás mejor.', en: 'It will hurt tomorrow, you will think better of it then.', concepts: ['v.doler', 'v.pensar'], level: 'B1', topics: ['health'] },
  { id: 's.v35', es: 'Nadie entenderá el chiste y jugaremos a otra cosa.', en: 'Nobody will get the joke and we will play something else.', concepts: ['v.entender', 'v.jugar'], level: 'B1', topics: ['hobbies'] },
  { id: 's.v36', es: 'Lo sentirás cuando te lo cuente todo.', en: 'You will be sorry when I tell you everything.', concepts: ['v.sentir', 'v.contar'], level: 'B2', topics: ['social'] },
  { id: 's.v37', es: 'No lo recordarás y lo olvidarás otra vez.', en: 'You will not remember it and will forget it again.', concepts: ['v.recordar', 'v.olvidar'], level: 'B1', topics: ['opinions'] },
  { id: 's.v38', es: 'Dejaré el coche fuera y cambiaré de sitio mañana.', en: 'I will leave the car outside and move it tomorrow.', concepts: ['v.dejar', 'v.cambiar'], level: 'B1', topics: ['transport'] },
  { id: 's.v39', es: 'Ganarán ellos y a nadie le parecerá raro.', en: 'They will win and nobody will find it odd.', concepts: ['v.ganar', 'v.parecer'], level: 'B2', topics: ['hobbies'] },
  { id: 's.v40', es: 'Nadie lo creerá hasta que consigamos la prueba.', en: 'Nobody will believe it until we get the evidence.', concepts: ['v.creer', 'v.conseguir', 'v.la-prueba'], level: 'B2', topics: ['opinions'] },
  { id: 's.v41', es: 'Eso no servirá y sólo moverá el problema de sitio.', en: 'That will not help and will only shift the problem elsewhere.', concepts: ['v.servir', 'v.mover'], level: 'B2', topics: ['work'] },
  { id: 's.v42', es: 'El árbol crecerá deprisa, aunque alguno morirá.', en: 'The tree will grow fast, though some will die.', concepts: ['v.crecer', 'v.morir'], level: 'B2', topics: ['weather'] },
  { id: 's.v43', es: 'Nacerá en marzo y todo caerá sobre nosotros.', en: 'She will be born in March and it will all fall on us.', concepts: ['v.nacer', 'v.caer'], level: 'B2', topics: ['family'] },
  { id: 's.v44', es: 'Supondré que estáis de acuerdo y mantendré la fecha.', en: 'I will assume you agree and keep the date.', concepts: ['v.suponer', 'v.mantener'], level: 'B2', topics: ['work'] },
  { id: 's.v45', es: 'Estableceremos el plazo y no permitiremos excepciones.', en: 'We will set the deadline and will not allow exceptions.', concepts: ['v.establecer', 'v.permitir', 'v.el-plazo'], level: 'B2', topics: ['work'] },
  { id: 's.v46', es: 'Nada impedirá que suceda, y resultará caro.', en: 'Nothing will stop it happening, and it will be expensive.', concepts: ['v.impedir', 'v.suceder', 'v.resultar'], level: 'B2', topics: ['opinions'] },

  // --- Conditional ---------------------------------------------------------
  { id: 's.v47', es: 'Yo pasaría antes y necesitaría media hora más.', en: 'I would come by earlier and would need another half hour.', concepts: ['v.pasar', 'v.necesitar'], level: 'B1', topics: ['plans'] },
  { id: 's.v48', es: 'Yo buscaría en otro sitio y abriría todas las cajas.', en: 'I would look somewhere else and open every box.', concepts: ['v.buscar', 'v.abrir'], level: 'B1', topics: ['home'] },
  { id: 's.v49', es: 'Yo cerraría a las siete y terminaría el resto mañana.', en: 'I would close at seven and finish the rest tomorrow.', concepts: ['v.cerrar', 'v.terminar'], level: 'B1', topics: ['work'] },
  { id: 's.v50', es: 'No encontrarías nada y dormirías peor.', en: 'You would not find anything and would sleep worse.', concepts: ['v.encontrar', 'v.dormir'], level: 'B1', topics: ['home'] },
  { id: 's.v51', es: 'Te dolería menos si volvieras andando.', en: 'It would hurt less if you walked back.', concepts: ['v.doler', 'v.volver'], level: 'B2', topics: ['health'] },
  { id: 's.v52', es: 'Nadie lo entendería y todos jugarían a lo mismo.', en: 'Nobody would understand it and everyone would play the same game.', concepts: ['v.entender', 'v.jugar'], level: 'B2', topics: ['opinions'] },
  { id: 's.v53', es: 'Lo sentiría mucho y no lo recordaría igual.', en: 'I would be very sorry and would not remember it the same way.', concepts: ['v.sentir', 'v.recordar'], level: 'B2', topics: ['feelings'] },
  { id: 's.v54', es: 'Cualquiera lo olvidaría y cambiaría de tema.', en: 'Anyone would forget it and change the subject.', concepts: ['v.olvidar', 'v.cambiar'], level: 'B2', topics: ['social'] },
  { id: 's.v55', es: 'Ganaríamos poco y a nadie le parecería justo.', en: 'We would earn little and nobody would think it fair.', concepts: ['v.ganar', 'v.parecer'], level: 'B2', topics: ['work'] },
  { id: 's.v56', es: 'Nadie se lo creería, aunque consiguiéramos la prueba.', en: 'Nobody would believe it, even if we got the evidence.', concepts: ['v.creer', 'v.conseguir'], level: 'B2', topics: ['opinions'] },
  { id: 's.v57', es: 'Eso no serviría y sólo movería la fecha.', en: 'That would not help and would only shift the date.', concepts: ['v.servir', 'v.mover'], level: 'B2', topics: ['work'] },
  { id: 's.v58', es: 'La planta crecería mejor fuera, aunque quizá moriría en enero.', en: 'The plant would grow better outside, though it might die in January.', concepts: ['v.crecer', 'v.morir'], level: 'B2', topics: ['home'] },
  { id: 's.v59', es: 'Nacería en primavera y todo caería en su sitio.', en: 'It would be born in spring and everything would fall into place.', concepts: ['v.nacer', 'v.caer'], level: 'B2', topics: ['family'] },
  { id: 's.v60', es: 'Eso ocurriría igual, y yo intentaría avisar antes.', en: 'That would happen anyway, and I would try to warn people first.', concepts: ['v.ocurrir', 'v.intentar'], level: 'B2', topics: ['opinions'] },
  { id: 's.v61', es: 'Supondría un lío y no mantendríamos el ritmo.', en: 'It would be a mess and we would not keep the pace up.', concepts: ['v.suponer', 'v.mantener'], level: 'B2', topics: ['work'] },
  { id: 's.v62', es: 'Estableceríamos otro criterio y no permitiríamos excepciones.', en: 'We would set another criterion and would allow no exceptions.', concepts: ['v.establecer', 'v.permitir', 'v.el-criterio'], level: 'B2', topics: ['work'] },
  { id: 's.v63', es: 'Nada impediría que sucediera antes.', en: 'Nothing would stop it happening sooner.', concepts: ['v.impedir', 'v.suceder'], level: 'B2', topics: ['opinions'] },

  // --- Present perfect -----------------------------------------------------
  { id: 's.v64', es: 'He necesitado ayuda y he esperado demasiado para pedirla.', en: 'I have needed help and waited too long to ask for it.', concepts: ['v.necesitar', 'v.esperar'], level: 'B1', topics: ['social'] },
  { id: 's.v65', es: 'Nos has ayudado mucho y has buscado tiempo que no tenías.', en: 'You have helped us a lot and found time you did not have.', concepts: ['v.ayudar', 'v.buscar'], level: 'B1', topics: ['social'] },
  { id: 's.v66', es: 'Han abierto la tienda nueva y han cerrado la de siempre.', en: 'They have opened the new shop and closed the old one.', concepts: ['v.abrir', 'v.cerrar'], level: 'B1', topics: ['shopping'] },
  { id: 's.v67', es: 'No he encontrado las gafas y me ha dolido la cabeza todo el día.', en: 'I have not found my glasses and my head has hurt all day.', concepts: ['v.encontrar', 'v.doler', 'v.gafas'], level: 'B1', topics: ['health'] },
  { id: 's.v68', es: 'Lo he pensado y hemos jugado bastante mal.', en: 'I have thought about it and we have played rather badly.', concepts: ['v.pensar', 'v.jugar'], level: 'B1', topics: ['hobbies'] },
  { id: 's.v69', es: 'Lo he sentido de verdad y te lo he contado tal cual.', en: 'I have genuinely been sorry and told you exactly as it was.', concepts: ['v.sentir', 'v.contar'], level: 'B2', topics: ['social'] },
  { id: 's.v70', es: '¿Has recordado el cumpleaños o has ganado tiempo otra vez?', en: 'Did you remember the birthday or buy yourself time again?', concepts: ['v.recordar', 'v.ganar'], level: 'B2', topics: ['social'] },
  { id: 's.v71', es: 'Lo he intentado y me ha parecido imposible.', en: 'I have tried and it has seemed impossible.', concepts: ['v.intentar', 'v.parecer'], level: 'B2', topics: ['work'] },
  { id: 's.v72', es: 'Nunca lo he creído y nunca he conseguido explicarlo.', en: 'I have never believed it and never managed to explain it.', concepts: ['v.creer', 'v.conseguir'], level: 'B2', topics: ['opinions'] },
  { id: 's.v73', es: 'Ese consejo me ha servido y ha movido bastante las cosas.', en: 'That advice has served me well and has shifted things a good deal.', concepts: ['v.servir', 'v.mover'], level: 'B2', topics: ['opinions'] },
  { id: 's.v74', es: 'La ciudad ha crecido y han nacido barrios enteros.', en: 'The city has grown and whole neighbourhoods have been born.', concepts: ['v.crecer', 'v.nacer', 'v.barrio'], level: 'B2', topics: ['city'] },
  { id: 's.v75', es: 'Han muerto dos árboles y se ha caído la valla.', en: 'Two trees have died and the fence has fallen down.', concepts: ['v.morir', 'v.caer'], level: 'B2', topics: ['home'] },
  { id: 's.v76', es: 'No ha ocurrido nada y todos hemos supuesto lo peor.', en: 'Nothing has happened and we have all assumed the worst.', concepts: ['v.ocurrir', 'v.suponer'], level: 'B2', topics: ['opinions'] },
  { id: 's.v77', es: 'Hemos mantenido el contacto y han establecido nuevas normas.', en: 'We have kept in touch and they have set new rules.', concepts: ['v.mantener', 'v.establecer'], level: 'B2', topics: ['work'] },
  { id: 's.v78', es: 'Nunca me han permitido entrar y nada me ha impedido intentarlo.', en: 'They have never let me in and nothing has stopped me trying.', concepts: ['v.permitir', 'v.impedir'], level: 'B2', topics: ['city'] },
  { id: 's.v79', es: 'Ha sucedido dos veces y siempre ha resultado igual.', en: 'It has happened twice and has always turned out the same.', concepts: ['v.suceder', 'v.resultar'], level: 'B2', topics: ['opinions'] },

  // --- Present subjunctive -------------------------------------------------
  { id: 's.v80', es: 'Espero que no necesites nada y que te ayude alguien.', en: 'I hope you do not need anything and that somebody helps you.', concepts: ['v.necesitar', 'v.ayudar'], level: 'B2', topics: ['social'] },
  { id: 's.v81', es: 'No creo que abran hoy ni que duerman mucho.', en: 'I do not think they will open today or sleep much.', concepts: ['v.abrir', 'v.dormir'], level: 'B2', topics: ['work'] },
  { id: 's.v82', es: 'Ojalá no te duela y vuelvas pronto.', en: 'I hope it does not hurt and you come back soon.', concepts: ['v.doler', 'v.volver'], level: 'B2', topics: ['health'] },
  { id: 's.v83', es: 'Quiero que lo pienses y que juegues sin presión.', en: 'I want you to think about it and play without pressure.', concepts: ['v.pensar', 'v.jugar'], level: 'B2', topics: ['hobbies'] },
  { id: 's.v84', es: 'Ojalá lo recuerdes y ganemos algo de tiempo.', en: 'I hope you remember it and we gain a bit of time.', concepts: ['v.recordar', 'v.ganar'], level: 'B2', topics: ['work'] },
  { id: 's.v85', es: 'No creo que te crea, ni que le sirva de nada.', en: 'I do not think he will believe you, or that it will do him any good.', concepts: ['v.creer', 'v.servir'], level: 'B2', topics: ['opinions'] },
  { id: 's.v86', es: 'Es raro que crezca tan rápido y que no se muera con este frío.', en: 'It is odd that it grows so fast and does not die in this cold.', concepts: ['v.crecer', 'v.morir'], level: 'B2', topics: ['home'] },
  { id: 's.v87', es: 'Antes de que nazca el niño, quiero que caiga todo en su sitio.', en: 'Before the baby is born, I want everything to fall into place.', concepts: ['v.nacer', 'v.caer', 'v.nino'], level: 'B2', topics: ['family'] },
  { id: 's.v88', es: 'No creo que ocurra nada ni que supongan lo contrario.', en: 'I do not think anything will happen or that they will assume otherwise.', concepts: ['v.ocurrir', 'v.suponer'], level: 'B2', topics: ['opinions'] },
  { id: 's.v89', es: 'Es importante que mantengan la calma y que nada lo impida.', en: 'It is important that they keep calm and that nothing prevents it.', concepts: ['v.mantener', 'v.impedir'], level: 'B2', topics: ['feelings'] },
  { id: 's.v90', es: 'Dudo que suceda así y que resulte tan sencillo.', en: 'I doubt it will happen that way or turn out that simple.', concepts: ['v.suceder', 'v.resultar'], level: 'B2', topics: ['opinions'] },

  // --- Present -------------------------------------------------------------
  { id: 's.v91', es: 'No recuerdo su nombre e intento no preguntarlo otra vez.', en: 'I cannot remember his name and I try not to ask again.', concepts: ['v.recordar', 'v.intentar', 'v.nombre'], level: 'B1', topics: ['people'] },
  { id: 's.v92', es: 'Muevo la mesa y todo crece de repente.', en: 'I move the table and everything suddenly feels bigger.', concepts: ['v.mover', 'v.crecer'], level: 'B1', topics: ['home'] },
  { id: 's.v93', es: 'Aquí nace poca gente y se muere poca también.', en: 'Few people are born here and few die here too.', concepts: ['v.nacer', 'v.morir'], level: 'B2', topics: ['city'] },
  { id: 's.v94', es: 'Se me cae todo y eso ocurre siempre con prisa.', en: 'I drop everything, and it always happens when I am in a rush.', concepts: ['v.caer', 'v.ocurrir'], level: 'B2', topics: ['daily-routine'] },
  { id: 's.v95', es: 'La norma establece un límite y eso sucede en todos los casos.', en: 'The rule sets a limit and that applies in every case.', concepts: ['v.establecer', 'v.suceder'], level: 'B2', topics: ['work'] },

  // --- Final top-up -------------------------------------------------------
  /**
   * The last thirteen. Several of the lines above put their second verb in a
   * subordinate subjunctive — "si volvieras", "aunque consiguiéramos" — which
   * is natural Spanish and simply not the tense the paradigm needed. These
   * carry the intended form in a main clause, where it cannot be swallowed.
   */
  { id: 's.v96', es: 'Yo volvería antes y jugaría el domingo.', en: 'I would come back earlier and play on Sunday.', concepts: ['v.volver', 'v.jugar'], level: 'B2', topics: ['plans', 'hobbies'] },
  { id: 's.v97', es: 'Así no conseguiríamos nada y todo se caería a pedazos.', en: 'We would get nowhere that way and it would all fall apart.', concepts: ['v.conseguir', 'v.caer'], level: 'B2', topics: ['work'] },
  { id: 's.v98', es: 'Sucedería lo mismo y nadie lo contaría después.', en: 'The same thing would happen and nobody would tell it afterwards.', concepts: ['v.suceder', 'v.contar'], level: 'B2', topics: ['storytelling'] },
  { id: 's.v99', es: 'Te lo contaré cuando lo sepa con certeza.', en: 'I will tell you when I know for certain.', concepts: ['v.contar'], level: 'B1', topics: ['social'] },
  { id: 's.v100', es: 'Conseguiremos el permiso y nada se caerá del calendario.', en: 'We will get the permit and nothing will drop off the calendar.', concepts: ['v.conseguir', 'v.caer'], level: 'B2', topics: ['work'] },
  { id: 's.v101', es: 'Sucederá igual el año que viene.', en: 'The same will happen next year.', concepts: ['v.suceder'], level: 'B2', topics: ['opinions'] },
  { id: 's.v102', es: 'La lista crece cada semana.', en: 'The list grows every week.', concepts: ['v.crecer'], level: 'B1', topics: ['work'] },
  { id: 's.v103', es: 'Siempre he supuesto lo mismo de ellos.', en: 'I have always assumed the same about them.', concepts: ['v.suponer'], level: 'B2', topics: ['opinions'] },
  { id: 's.v104', es: 'Sucedió justo cuando nadie miraba.', en: 'It happened exactly when nobody was looking.', concepts: ['v.suceder'], level: 'B2', topics: ['storytelling', 'past'] },
  { id: 's.v105', es: 'La idea resultaba atractiva sobre el papel.', en: 'The idea seemed attractive on paper.', concepts: ['v.resultar'], level: 'B2', topics: ['work', 'past'] },
  { id: 's.v106', es: 'Volverías a hacerlo, y lo sabes.', en: 'You would do it again, and you know it.', concepts: ['v.volver'], level: 'B2', topics: ['opinions'] },
  { id: 's.v107', es: 'Jugaríamos más si el campo estuviera libre.', en: 'We would play more if the pitch were free.', concepts: ['v.jugar'], level: 'B2', topics: ['hobbies'] },
  { id: 's.v108', es: 'Contaremos con vosotros para lo del sábado.', en: 'We will count on you lot for the Saturday thing.', concepts: ['v.contar'], level: 'B1', topics: ['social'] },
];
