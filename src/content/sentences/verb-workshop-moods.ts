import type { Sentence } from '@/content/types';

/**
 * The future, the conditional and the subjunctive of the course's core verbs.
 *
 * Its own file because it closes a specific hole rather than a topic. When the
 * forty-four new verbs were added, the corpus behind them was overwhelmingly
 * present and preterite: measured against `verb-corpus.ts`, the future had 0
 * supporting sentences for the A1 verbs, the conditional 0, and the present
 * subjunctive 1. A paradigm with no sentence carrying one of its forms is not
 * dead — `buildVerbForm` can still ask "which form goes with *nosotros*?" off
 * the table — but it is **table-only**, which is the state every present
 * perfect and every reflexive in this course was silently stuck in until the
 * corpus index learned to match multi-word forms.
 *
 * Table-only practice teaches a learner to recite a paradigm. Sentences teach
 * them to use it. So these lines exist to make the three non-indicative moods
 * reachable in ordinary exercises, and they are written as the things those
 * moods are actually *for*: plans and predictions, softened requests and
 * hypotheticals, and everything that follows a wish, a doubt or a *cuando*.
 */
export const verbWorkshopMoodSentences: Sentence[] = [
  // --- Future: plans and predictions ---------------------------------------
  { id: 's.h1', es: 'Mañana llegaré temprano y abriré la oficina.', en: "Tomorrow I'll arrive early and open the office.", concepts: ['v.llegar', 'v.abrir', 'v.temprano', 'v.oficina'], level: 'B1', topics: ['work', 'plans'] },
  { id: 's.h2', es: 'El lunes empezaremos con el nuevo horario.', en: "On Monday we'll start with the new timetable.", concepts: ['v.empezar', 'v.nuevo'], level: 'B1', topics: ['work', 'plans'] },
  { id: 's.h3', es: '¿Terminaréis a tiempo?', en: 'Will you lot finish on time?', concepts: ['v.terminar'], level: 'B1', topics: ['work'] },
  { id: 's.h4', es: 'Te esperaré en la puerta del cine.', en: "I'll wait for you at the cinema door.", concepts: ['v.esperar', 'v.cine', 'v.puerta'], level: 'B1', topics: ['plans', 'city'] },
  { id: 's.h5', es: 'Necesitaremos dos coches para ir todos.', en: "We'll need two cars for everyone to go.", concepts: ['v.necesitar'], level: 'B1', topics: ['plans', 'transport'] },
  { id: 's.h6', es: 'Cerrarán la piscina en septiembre.', en: "They'll close the pool in September.", concepts: ['v.cerrar'], level: 'B1', topics: ['city', 'plans'] },
  { id: 's.h7', es: 'Te ayudaré con la mudanza, no te preocupes.', en: "I'll help you with the move, don't worry.", concepts: ['v.ayudar'], level: 'B1', topics: ['social', 'home'] },
  { id: 's.h8', es: 'Buscaremos un piso más grande el año que viene.', en: "We'll look for a bigger flat next year.", concepts: ['v.buscar'], level: 'B1', topics: ['home', 'plans'] },
  { id: 's.h9', es: 'Dormiré en el sofá, no pasa nada.', en: "I'll sleep on the sofa, it's fine.", concepts: ['v.dormir', 'v.sofa'], level: 'B1', topics: ['home'] },
  { id: 's.h10', es: 'Seguro que lo encontrarás.', en: "I'm sure you'll find it.", concepts: ['v.encontrar'], level: 'B1', topics: ['social'] },
  { id: 's.h11', es: 'Volveremos antes de las diez.', en: "We'll be back before ten.", concepts: ['v.volver'], level: 'B1', topics: ['plans'] },
  { id: 's.h12', es: 'Lo pensaré esta noche y te digo mañana.', en: "I'll think about it tonight and tell you tomorrow.", concepts: ['v.pensar'], level: 'B1', topics: ['plans', 'opinions'] },
  { id: 's.h13', es: 'Nadie entenderá nada si hablas tan rápido.', en: 'Nobody will understand a thing if you talk that fast.', concepts: ['v.entender'], level: 'B1', topics: ['social'] },
  { id: 's.h14', es: 'Perderás el tren si no sales ya.', en: "You'll miss the train if you don't leave now.", concepts: ['v.perder'], level: 'B1', topics: ['transport'] },
  { id: 's.h15', es: 'Jugaremos el domingo por la mañana.', en: "We'll play on Sunday morning.", concepts: ['v.jugar'], level: 'B1', topics: ['hobbies', 'plans'] },
  { id: 's.h16', es: 'Te contaré todo cuando nos veamos.', en: "I'll tell you everything when we meet.", concepts: ['v.contar'], level: 'B1', topics: ['social', 'storytelling'] },
  { id: 's.h17', es: 'No lo recordarás mañana.', en: "You won't remember it tomorrow.", concepts: ['v.recordar'], level: 'B1', topics: ['opinions'] },
  { id: 's.h18', es: 'Se te olvidará otra vez, ya verás.', en: "You'll forget again, you'll see.", concepts: ['v.olvidar'], level: 'B1', topics: ['social'] },
  { id: 's.h19', es: 'Cambiaremos de tema, mejor.', en: "We'll change the subject, better that way.", concepts: ['v.cambiar'], level: 'B1', topics: ['social'] },
  { id: 's.h20', es: 'Ganarán ellos, está claro.', en: "They'll win, it's obvious.", concepts: ['v.ganar'], level: 'B1', topics: ['hobbies', 'opinions'] },
  { id: 's.h21', es: 'Lo intentaremos otra vez la semana que viene.', en: "We'll try again next week.", concepts: ['v.intentar'], level: 'B1', topics: ['plans'] },
  { id: 's.h22', es: 'Te parecerá una tontería, pero funciona.', en: "It'll seem silly to you, but it works.", concepts: ['v.parecer'], level: 'B2', topics: ['opinions'] },
  { id: 's.h23', es: 'Nadie lo creerá.', en: 'Nobody will believe it.', concepts: ['v.creer'], level: 'B1', topics: ['opinions'] },
  { id: 's.h24', es: 'Conseguiremos la financiación, estoy seguro.', en: "We'll get the funding, I'm sure.", concepts: ['v.conseguir'], level: 'B2', topics: ['work'] },
  { id: 's.h25', es: 'Eso no servirá de nada.', en: "That won't be any use.", concepts: ['v.servir'], level: 'B1', topics: ['opinions'] },
  { id: 's.h26', es: 'Moveremos los muebles el sábado.', en: "We'll move the furniture on Saturday.", concepts: ['v.mover'], level: 'B1', topics: ['home', 'plans'] },
  { id: 's.h27', es: 'Los árboles crecerán muy deprisa aquí.', en: 'The trees will grow very fast here.', concepts: ['v.crecer'], level: 'B1', topics: ['weather'] },
  { id: 's.h28', es: 'El niño nacerá en marzo.', en: 'The baby will be born in March.', concepts: ['v.nacer', 'v.nino'], level: 'B1', topics: ['family'] },
  { id: 's.h29', es: 'Esa planta morirá sin agua.', en: 'That plant will die without water.', concepts: ['v.morir'], level: 'B1', topics: ['home'] },
  { id: 's.h30', es: 'Se caerá si sigues así.', en: "It'll fall if you carry on like that.", concepts: ['v.caer'], level: 'B1', topics: ['home'] },
  { id: 's.h31', es: 'Ocurrirá lo mismo el año que viene.', en: 'The same thing will happen next year.', concepts: ['v.ocurrir'], level: 'B2', topics: ['opinions'] },
  { id: 's.h32', es: 'Supondré que estáis de acuerdo.', en: "I'll assume you agree.", concepts: ['v.suponer'], level: 'B2', topics: ['opinions', 'work'] },
  { id: 's.h33', es: 'Mantendremos el precio hasta enero.', en: "We'll hold the price until January.", concepts: ['v.mantener', 'v.precio'], level: 'B2', topics: ['work'] },
  { id: 's.h34', es: 'Estableceremos un plazo razonable.', en: "We'll set a reasonable deadline.", concepts: ['v.establecer'], level: 'B2', topics: ['work'] },
  { id: 's.h35', es: 'No permitirán la entrada sin identificación.', en: "They won't allow entry without ID.", concepts: ['v.permitir'], level: 'B2', topics: ['city'] },
  { id: 's.h36', es: 'Nada impedirá que sigamos adelante.', en: 'Nothing will stop us going ahead.', concepts: ['v.impedir'], level: 'B2', topics: ['work'] },
  { id: 's.h37', es: 'Sucederá tarde o temprano.', en: "It'll happen sooner or later.", concepts: ['v.suceder'], level: 'B2', topics: ['opinions'] },
  { id: 's.h38', es: 'Resultará más caro de lo que pensáis.', en: "It'll work out more expensive than you lot think.", concepts: ['v.resultar', 'v.pensar'], level: 'B2', topics: ['opinions'] },
  { id: 's.h39', es: 'Pasaremos por tu casa a las siete.', en: "We'll come by your place at seven.", concepts: ['v.pasar'], level: 'B1', topics: ['plans'] },
  { id: 's.h40', es: 'Me dolerá mañana, seguro.', en: "It'll hurt tomorrow, definitely.", concepts: ['v.doler'], level: 'B1', topics: ['health'] },

  // --- Conditional: softening, hypotheticals, reported future --------------
  { id: 's.h41', es: 'Yo llegaría antes en metro.', en: "I'd get there sooner by metro.", concepts: ['v.llegar'], level: 'B1', topics: ['transport', 'opinions'] },
  { id: 's.h42', es: '¿Me ayudarías con esto un momento?', en: 'Would you help me with this for a moment?', concepts: ['v.ayudar'], level: 'B1', topics: ['social'] },
  { id: 's.h43', es: 'Yo esperaría un poco más.', en: "I'd wait a bit longer.", concepts: ['v.esperar'], level: 'B1', topics: ['opinions'] },
  { id: 's.h44', es: 'Necesitaríamos más tiempo para hacerlo bien.', en: "We'd need more time to do it properly.", concepts: ['v.necesitar'], level: 'B1', topics: ['work'] },
  { id: 's.h45', es: 'Yo no cerraría todavía.', en: "I wouldn't close yet.", concepts: ['v.cerrar'], level: 'B1', topics: ['work', 'opinions'] },
  { id: 's.h46', es: 'Empezaría por lo más difícil.', en: "I'd start with the hardest part.", concepts: ['v.empezar'], level: 'B1', topics: ['work', 'opinions'] },
  { id: 's.h47', es: 'Yo buscaría en otro sitio.', en: "I'd look somewhere else.", concepts: ['v.buscar'], level: 'B1', topics: ['opinions'] },
  { id: 's.h48', es: 'Dormiríamos mejor sin ese ruido.', en: "We'd sleep better without that noise.", concepts: ['v.dormir'], level: 'B1', topics: ['home'] },
  { id: 's.h49', es: 'Volvería encantado a ese restaurante.', en: "I'd happily go back to that restaurant.", concepts: ['v.volver', 'v.restaurante'], level: 'B1', topics: ['restaurant', 'opinions'] },
  { id: 's.h50', es: 'Yo lo pensaría dos veces.', en: "I'd think twice about it.", concepts: ['v.pensar'], level: 'B1', topics: ['opinions'] },
  { id: 's.h51', es: 'Nadie lo entendería así explicado.', en: 'Nobody would understand it explained like that.', concepts: ['v.entender'], level: 'B2', topics: ['opinions'] },
  { id: 's.h52', es: 'Perderíamos mucho tiempo.', en: "We'd lose a lot of time.", concepts: ['v.perder'], level: 'B1', topics: ['work'] },
  { id: 's.h53', es: 'Te lo contaría, pero prometí no decir nada.', en: "I'd tell you, but I promised not to say anything.", concepts: ['v.contar'], level: 'B2', topics: ['social'] },
  { id: 's.h54', es: 'Yo cambiaría el título.', en: "I'd change the title.", concepts: ['v.cambiar'], level: 'B1', topics: ['work', 'opinions'] },
  { id: 's.h55', es: 'Me parecería raro que no viniera.', en: "It'd seem odd to me if he didn't come.", concepts: ['v.parecer'], level: 'B2', topics: ['opinions'] },
  { id: 's.h56', es: 'Nadie se lo creería.', en: 'Nobody would believe it.', concepts: ['v.creer'], level: 'B2', topics: ['opinions'] },
  { id: 's.h57', es: 'Así no conseguiríamos nada.', en: "We wouldn't get anywhere like that.", concepts: ['v.conseguir'], level: 'B2', topics: ['work'] },
  { id: 's.h58', es: 'Eso no serviría de mucho.', en: "That wouldn't help much.", concepts: ['v.servir'], level: 'B2', topics: ['opinions'] },
  { id: 's.h59', es: 'Yo no movería nada de sitio.', en: "I wouldn't move anything.", concepts: ['v.mover'], level: 'B2', topics: ['home'] },
  { id: 's.h60', es: 'Supondría un esfuerzo enorme.', en: 'It would involve an enormous effort.', concepts: ['v.suponer'], level: 'B2', topics: ['work'] },
  { id: 's.h61', es: 'Mantendríamos el mismo equipo.', en: "We'd keep the same team.", concepts: ['v.mantener'], level: 'B2', topics: ['work'] },
  { id: 's.h62', es: 'Resultaría más sencillo hacerlo por la mañana.', en: "It'd be simpler to do it in the morning.", concepts: ['v.resultar'], level: 'B2', topics: ['work'] },
  { id: 's.h63', es: 'Yo terminaría esto antes de irme.', en: "I'd finish this before leaving.", concepts: ['v.terminar'], level: 'B1', topics: ['work', 'opinions'] },
  { id: 's.h64', es: 'Abriría una ventana, hace mucho calor.', en: "I'd open a window, it's very hot.", concepts: ['v.abrir', 'v.ventana'], level: 'B1', topics: ['home', 'weather'] },
  { id: 's.h65', es: 'Jugaríamos más si tuviéramos tiempo.', en: "We'd play more if we had time.", concepts: ['v.jugar'], level: 'B2', topics: ['hobbies'] },

  // --- Present subjunctive: wishes, doubts, cuando -------------------------
  { id: 's.h66', es: 'Espero que llegues bien.', en: 'I hope you get there safely.', concepts: ['v.llegar', 'v.esperar'], level: 'B1', topics: ['social', 'travel'] },
  { id: 's.h67', es: 'Cuando termines el informe, mándamelo.', en: 'When you finish the report, send it to me.', concepts: ['v.terminar'], level: 'B1', topics: ['work'] },
  { id: 's.h68', es: 'No creo que abran hoy.', en: "I don't think they'll open today.", concepts: ['v.abrir', 'v.creer'], level: 'B1', topics: ['shopping', 'opinions'] },
  { id: 's.h69', es: 'Ojalá no cierren la tienda.', en: "I hope they don't close the shop.", concepts: ['v.cerrar'], level: 'B1', topics: ['shopping'] },
  { id: 's.h70', es: 'Quiero que empecemos ya.', en: 'I want us to start now.', concepts: ['v.empezar'], level: 'B1', topics: ['work'] },
  { id: 's.h71', es: 'Es mejor que esperéis fuera.', en: "It's better if you lot wait outside.", concepts: ['v.esperar', 'v.fuera-de'], level: 'B1', topics: ['social'] },
  { id: 's.h72', es: 'Dile que me ayude, por favor.', en: 'Tell him to help me, please.', concepts: ['v.ayudar'], level: 'B1', topics: ['social'] },
  { id: 's.h73', es: 'No creo que lo encuentres ahí.', en: "I don't think you'll find it there.", concepts: ['v.encontrar'], level: 'B1', topics: ['opinions'] },
  { id: 's.h74', es: 'Aunque duermas ocho horas, seguirás cansado.', en: "Even if you sleep eight hours, you'll still be tired.", concepts: ['v.dormir'], level: 'B2', topics: ['health'] },
  { id: 's.h75', es: 'En cuanto vuelvas, hablamos.', en: "As soon as you're back, we'll talk.", concepts: ['v.volver', 'p.en-cuanto'], level: 'B1', topics: ['plans'] },
  { id: 's.h76', es: 'No creo que lo entienda.', en: "I don't think he understands it.", concepts: ['v.entender'], level: 'B1', topics: ['opinions'] },
  { id: 's.h77', es: 'Espero que no perdáis el vuelo.', en: "I hope you don't miss the flight.", concepts: ['v.perder'], level: 'B1', topics: ['travel'] },
  { id: 's.h78', es: 'Quiero que me lo cuentes todo.', en: 'I want you to tell me everything.', concepts: ['v.contar'], level: 'B1', topics: ['social'] },
  { id: 's.h79', es: 'Ojalá lo recuerdes mañana.', en: 'I hope you remember it tomorrow.', concepts: ['v.recordar'], level: 'B1', topics: ['social'] },
  { id: 's.h80', es: 'No dejes que se te olvide.', en: "Don't let yourself forget it.", concepts: ['v.olvidar', 'v.dejar'], level: 'B2', topics: ['social'] },
  { id: 's.h81', es: 'Es normal que las cosas cambien.', en: "It's normal for things to change.", concepts: ['v.cambiar'], level: 'B1', topics: ['opinions'] },
  { id: 's.h82', es: 'Espero que ganéis.', en: 'I hope you lot win.', concepts: ['v.ganar'], level: 'B1', topics: ['hobbies'] },
  { id: 's.h83', es: 'Basta con que lo intentes.', en: "It's enough that you try.", concepts: ['v.intentar'], level: 'B2', topics: ['social'] },
  { id: 's.h84', es: 'No me parece que sirva de mucho.', en: "It doesn't seem to me that it helps much.", concepts: ['v.parecer', 'v.servir'], level: 'B2', topics: ['opinions'] },
  { id: 's.h85', es: 'Dudo que consiga terminarlo hoy.', en: 'I doubt he will manage to finish it today.', concepts: ['v.conseguir', 'v.terminar'], level: 'B2', topics: ['work'] },
  { id: 's.h86', es: 'Antes de que se caiga, sujétalo.', en: 'Before it falls, hold it.', concepts: ['v.caer'], level: 'B2', topics: ['home'] },
  { id: 's.h87', es: 'No creo que ocurra nada.', en: "I don't think anything will happen.", concepts: ['v.ocurrir'], level: 'B2', topics: ['opinions'] },
  { id: 's.h88', es: 'Supongamos que tengan razón.', en: "Let's suppose they're right.", concepts: ['v.suponer'], level: 'B2', topics: ['opinions'] },
  { id: 's.h89', es: 'Es importante que mantengamos la calma.', en: "It's important that we keep calm.", concepts: ['v.mantener'], level: 'B2', topics: ['feelings'] },
  { id: 's.h90', es: 'Conviene que establezcamos las reglas antes.', en: "It's advisable that we set the rules first.", concepts: ['v.establecer'], level: 'B2', topics: ['work'] },
  { id: 's.h91', es: 'No permitas que te hablen así.', en: "Don't let them talk to you like that.", concepts: ['v.permitir'], level: 'B2', topics: ['social'] },
  { id: 's.h92', es: 'Nada impide que lo intentemos otra vez.', en: 'Nothing prevents us trying again.', concepts: ['v.impedir', 'v.intentar'], level: 'B2', topics: ['work'] },
  { id: 's.h93', es: 'Pase lo que pase, avísame.', en: 'Whatever happens, let me know.', concepts: ['v.pasar'], level: 'B2', topics: ['social'] },
  { id: 's.h94', es: 'Espero que no te duela mucho.', en: "I hope it doesn't hurt too much.", concepts: ['v.doler'], level: 'B1', topics: ['health'] },
  { id: 's.h95', es: 'Quizás necesitemos otra silla.', en: 'We might need another chair.', concepts: ['v.necesitar', 'v.silla', 'p.quizas'], level: 'B1', topics: ['home'] },
  { id: 's.h96', es: 'Busca hasta que lo encuentres.', en: 'Keep looking until you find it.', concepts: ['v.buscar', 'v.encontrar', 'p.hasta-que'], level: 'B2', topics: ['daily-routine'] },
  { id: 's.h97', es: 'Te lo explico para que lo entiendas.', en: "I'll explain it so that you understand.", concepts: ['v.entender', 'p.para-que'], level: 'B2', topics: ['university'] },
  { id: 's.h98', es: 'No creo que crezca mucho más.', en: "I don't think it'll grow much more.", concepts: ['v.crecer'], level: 'B2', topics: ['home'] },
  { id: 's.h99', es: 'Es una pena que se muera esa costumbre.', en: "It's a shame that custom is dying out.", concepts: ['v.morir'], level: 'B2', topics: ['opinions'] },
  { id: 's.h100', es: 'Ojalá resulte más fácil de lo que parece.', en: 'I hope it turns out easier than it looks.', concepts: ['v.resultar', 'v.parecer'], level: 'B2', topics: ['opinions'] },
  { id: 's.h101', es: 'Cuando nazca el niño, todo cambiará.', en: 'When the baby is born, everything will change.', concepts: ['v.nacer', 'v.cambiar', 'v.nino'], level: 'B2', topics: ['family'] },
  { id: 's.h102', es: 'No creo que suceda nada grave.', en: "I don't think anything serious will happen.", concepts: ['v.suceder'], level: 'B2', topics: ['opinions'] },
  { id: 's.h103', es: 'Es raro que jueguen tan tarde.', en: "It's odd that they play so late.", concepts: ['v.jugar'], level: 'B2', topics: ['hobbies'] },
  { id: 's.h104', es: 'Me alegro de que os sintáis bien aquí.', en: "I'm glad you lot feel good here.", concepts: ['v.sentir', 'v.alegrarse'], level: 'B2', topics: ['feelings', 'social'] },
  { id: 's.h105', es: 'No creo que muevan la fecha.', en: "I don't think they'll move the date.", concepts: ['v.mover'], level: 'B2', topics: ['work'] },
];
