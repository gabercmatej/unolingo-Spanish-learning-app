import type { Sentence } from '@/content/types';

/**
 * Commands, written the way this corpus has to write them.
 *
 * The imperative is separated from every other paradigm **by position, not by
 * tag**: "Ella habla despacio" and "¡Habla más despacio!" are the same six
 * letters, the same verb and the same `v.hablar`, and no amount of
 * corroboration can tell them apart. So a command in this corpus opens with
 * `¡`, puts the verb first, and closes with `!` — and `verb-corpus.ts` applies
 * that symmetrically, counting only sentence-initial forms inside `¡…!` as
 * imperatives and making every other paradigm skip them. Without the second
 * half one sentence would feed two paradigms and both numbers would be wrong
 * upwards.
 *
 * Every verb here gets all five persons the imperative has — `tú`, `usted`,
 * `nosotros`, `vosotros`, `ustedes` — because `verb-flow.test.ts` requires five
 * persons of corpus evidence per imperative paradigm, and a paradigm short of
 * that is one the generator can only ask about from a table.
 *
 * The `usted` and `ustedes` forms carry their own register: they are what a
 * doctor, a guard or a shopkeeper says, so they are written as those people
 * would say them rather than as the tú lines with different endings.
 */
export const imperativeSentences: Sentence[] = [
  // --- llegar --------------------------------------------------------------
  { id: 's.i2', es: '¡Llega puntual por una vez!', en: 'Be on time for once!', concepts: ['v.llegar'], level: 'A2', topics: ['time'] },
  { id: 's.i3', es: '¡Llegue antes de las nueve, por favor!', en: 'Please arrive before nine!', concepts: ['v.llegar'], level: 'A2', topics: ['work'] },
  { id: 's.i4', es: '¡Lleguemos temprano al aeropuerto!', en: "Let's get to the airport early!", concepts: ['v.llegar', 'v.aeropuerto', 'v.temprano'], level: 'A2', topics: ['travel'] },
  { id: 's.i5', es: '¡Llegad pronto, que empieza a las ocho!', en: 'Get here soon, it starts at eight!', concepts: ['v.llegar'], level: 'A2', topics: ['plans'] },
  { id: 's.i6', es: '¡Lleguen por la puerta principal!', en: 'Come in through the main door!', concepts: ['v.llegar', 'v.puerta'], level: 'A2', topics: ['city'] },

  // --- pasar ---------------------------------------------------------------
  { id: 's.i7', es: '¡Pasa, no te quedes en la puerta!', en: "Come in, don't stand in the doorway!", concepts: ['v.pasar', 'v.puerta'], level: 'A2', topics: ['social'] },
  { id: 's.i8', es: '¡Pase usted primero!', en: 'After you!', concepts: ['v.pasar'], level: 'A2', topics: ['social'] },
  { id: 's.i9', es: '¡Pasemos al salón!', en: "Let's go through to the living room!", concepts: ['v.pasar', 'v.salon'], level: 'A2', topics: ['home'] },
  { id: 's.i10', es: '¡Pasad, la cena está lista!', en: 'Come in, dinner is ready!', concepts: ['v.pasar'], level: 'A2', topics: ['food'] },
  { id: 's.i11', es: '¡Pasen por aquí, señores!', en: 'This way, gentlemen!', concepts: ['v.pasar'], level: 'A2', topics: ['restaurant'] },

  // --- esperar -------------------------------------------------------------
  { id: 's.i12', es: '¡Espera un minuto!', en: 'Wait a minute!', concepts: ['v.esperar', 'v.minuto'], level: 'A2', topics: ['social'] },
  { id: 's.i13', es: '¡Espere aquí, ahora le atiendo!', en: "Wait here, I'll be with you shortly!", concepts: ['v.esperar'], level: 'A2', topics: ['shopping'] },
  { id: 's.i14', es: '¡Esperemos a que deje de llover!', en: "Let's wait until it stops raining!", concepts: ['v.esperar'], level: 'B1', topics: ['weather'] },
  { id: 's.i15', es: '¡Esperad fuera, por favor!', en: 'Wait outside, please!', concepts: ['v.esperar', 'v.fuera-de'], level: 'A2', topics: ['social'] },
  { id: 's.i16', es: '¡Esperen su turno!', en: 'Wait your turn!', concepts: ['v.esperar'], level: 'A2', topics: ['city'] },

  // --- ayudar --------------------------------------------------------------
  { id: 's.i17', es: '¡Ayuda a tu hermano con la maleta!', en: 'Help your brother with the suitcase!', concepts: ['v.ayudar'], level: 'A2', topics: ['family', 'travel'] },
  { id: 's.i18', es: '¡Ayude a este señor, por favor!', en: 'Help this gentleman, please!', concepts: ['v.ayudar'], level: 'A2', topics: ['social'] },
  { id: 's.i19', es: '¡Ayudemos a recoger la mesa!', en: "Let's help clear the table!", concepts: ['v.ayudar'], level: 'A2', topics: ['home'] },
  { id: 's.i20', es: '¡Ayudad un poco en la cocina!', en: 'Give us a hand in the kitchen!', concepts: ['v.ayudar', 'v.cocina'], level: 'A2', topics: ['home'] },
  { id: 's.i21', es: '¡Ayuden a los que llegan nuevos!', en: 'Help the ones who are new!', concepts: ['v.ayudar'], level: 'B1', topics: ['work'] },

  // --- buscar --------------------------------------------------------------
  { id: 's.i22', es: '¡Busca las llaves en el bolso!', en: 'Look for the keys in the bag!', concepts: ['v.buscar', 'v.bolso'], level: 'A2', topics: ['home'] },
  { id: 's.i23', es: '¡Busque en el segundo cajón!', en: 'Look in the second drawer!', concepts: ['v.buscar'], level: 'A2', topics: ['home'] },
  { id: 's.i24', es: '¡Busquemos otro sitio para comer!', en: "Let's find somewhere else to eat!", concepts: ['v.buscar'], level: 'A2', topics: ['restaurant'] },
  { id: 's.i25', es: '¡Buscad bien antes de decir que no está!', en: 'Look properly before you say it is not there!', concepts: ['v.buscar'], level: 'B1', topics: ['home'] },
  { id: 's.i26', es: '¡Busquen el número en la lista!', en: 'Look for the number on the list!', concepts: ['v.buscar'], level: 'A2', topics: ['work'] },

  // --- abrir ---------------------------------------------------------------
  { id: 's.i27', es: '¡Abre la ventana, hace calor!', en: 'Open the window, it is hot!', concepts: ['v.abrir', 'v.ventana'], level: 'A2', topics: ['home', 'weather'] },
  { id: 's.i28', es: '¡Abra la boca, por favor!', en: 'Open your mouth, please!', concepts: ['v.abrir', 'v.boca'], level: 'A2', topics: ['health'] },
  { id: 's.i29', es: '¡Abramos el vino ya!', en: "Let's open the wine now!", concepts: ['v.abrir'], level: 'A2', topics: ['food'] },
  { id: 's.i30', es: '¡Abrid los libros por la página treinta!', en: 'Open your books at page thirty!', concepts: ['v.abrir'], level: 'A2', topics: ['university'] },
  { id: 's.i31', es: '¡Abran paso, por favor!', en: 'Make way, please!', concepts: ['v.abrir'], level: 'B1', topics: ['city'] },

  // --- cerrar --------------------------------------------------------------
  { id: 's.i32', es: '¡Cierra la puerta, entra frío!', en: 'Close the door, cold is getting in!', concepts: ['v.cerrar', 'v.puerta'], level: 'A2', topics: ['home'] },
  { id: 's.i33', es: '¡Cierre bien al salir!', en: 'Lock up properly on your way out!', concepts: ['v.cerrar'], level: 'A2', topics: ['home'] },
  { id: 's.i34', es: '¡Cerremos la cocina antes de irnos!', en: "Let's shut the kitchen before we go!", concepts: ['v.cerrar', 'v.cocina'], level: 'A2', topics: ['home'] },
  { id: 's.i35', es: '¡Cerrad las ventanas, viene tormenta!', en: 'Close the windows, a storm is coming!', concepts: ['v.cerrar', 'v.ventana', 'v.tormenta'], level: 'A2', topics: ['weather', 'home'] },
  { id: 's.i36', es: '¡Cierren los ordenadores, se acabó!', en: 'Shut your computers, that is it!', concepts: ['v.cerrar'], level: 'B1', topics: ['work'] },

  // --- empezar -------------------------------------------------------------
  { id: 's.i37', es: '¡Empieza por el principio!', en: 'Start at the beginning!', concepts: ['v.empezar'], level: 'A2', topics: ['storytelling'] },
  { id: 's.i38', es: '¡Empiece cuando quiera!', en: 'Start whenever you like!', concepts: ['v.empezar'], level: 'B1', topics: ['work'] },
  { id: 's.i39', es: '¡Empecemos ya, que se hace tarde!', en: "Let's start now, it is getting late!", concepts: ['v.empezar'], level: 'A2', topics: ['time'] },
  { id: 's.i40', es: '¡Empezad sin mí!', en: 'Start without me!', concepts: ['v.empezar'], level: 'A2', topics: ['social'] },
  { id: 's.i41', es: '¡Empiecen por la primera pregunta!', en: 'Start with the first question!', concepts: ['v.empezar'], level: 'A2', topics: ['university'] },

  // --- terminar ------------------------------------------------------------
  { id: 's.i42', es: '¡Termina la sopa!', en: 'Finish your soup!', concepts: ['v.terminar', 'v.sopa'], level: 'A2', topics: ['food'] },
  { id: 's.i43', es: '¡Termine el informe hoy, por favor!', en: 'Please finish the report today!', concepts: ['v.terminar'], level: 'B1', topics: ['work'] },
  { id: 's.i44', es: '¡Terminemos esto y nos vamos!', en: "Let's finish this and go!", concepts: ['v.terminar'], level: 'A2', topics: ['work'] },
  { id: 's.i45', es: '¡Terminad de recoger, por favor!', en: 'Finish tidying up, please!', concepts: ['v.terminar'], level: 'A2', topics: ['home'] },
  { id: 's.i46', es: '¡Terminen antes de las seis!', en: 'Finish before six!', concepts: ['v.terminar'], level: 'A2', topics: ['work'] },

  // --- encontrar -----------------------------------------------------------
  { id: 's.i47', es: '¡Encuentra el error tú solo!', en: 'Find the mistake yourself!', concepts: ['v.encontrar'], level: 'B1', topics: ['university'] },
  { id: 's.i48', es: '¡Encuentre un hueco esta semana!', en: 'Find a slot this week!', concepts: ['v.encontrar'], level: 'B1', topics: ['work'] },
  { id: 's.i49', es: '¡Encontremos una solución entre todos!', en: "Let's find a solution between us!", concepts: ['v.encontrar'], level: 'B1', topics: ['work'] },
  { id: 's.i50', es: '¡Encontrad el sitio en el mapa!', en: 'Find the place on the map!', concepts: ['v.encontrar', 'v.mapa'], level: 'A2', topics: ['directions'] },
  { id: 's.i51', es: '¡Encuentren su asiento, por favor!', en: 'Find your seat, please!', concepts: ['v.encontrar'], level: 'B1', topics: ['transport'] },

  // --- dormir --------------------------------------------------------------
  { id: 's.i52', es: '¡Duerme un poco, tienes mala cara!', en: 'Get some sleep, you look awful!', concepts: ['v.dormir', 'v.cara'], level: 'A2', topics: ['health'] },
  { id: 's.i53', es: '¡Duerma toda la noche si puede!', en: 'Sleep through the night if you can!', concepts: ['v.dormir'], level: 'B1', topics: ['health'] },
  { id: 's.i54', es: '¡Durmamos una hora antes de salir!', en: "Let's sleep an hour before we go out!", concepts: ['v.dormir'], level: 'B1', topics: ['daily-routine'] },
  { id: 's.i55', es: '¡Dormid bien, mañana madrugamos!', en: 'Sleep well, we are up early tomorrow!', concepts: ['v.dormir'], level: 'A2', topics: ['daily-routine'] },
  { id: 's.i56', es: '¡Duerman lo que puedan en el avión!', en: 'Sleep what you can on the plane!', concepts: ['v.dormir', 'v.avion'], level: 'B1', topics: ['travel'] },

  // --- volver --------------------------------------------------------------
  { id: 's.i57', es: '¡Vuelve antes de las once!', en: 'Be back before eleven!', concepts: ['v.volver'], level: 'A2', topics: ['plans'] },
  { id: 's.i58', es: '¡Vuelva mañana con el pasaporte!', en: 'Come back tomorrow with your passport!', concepts: ['v.volver', 'v.pasaporte'], level: 'A2', topics: ['travel'] },
  { id: 's.i59', es: '¡Volvamos por el mismo camino!', en: "Let's go back the same way!", concepts: ['v.volver'], level: 'A2', topics: ['directions'] },
  { id: 's.i60', es: '¡Volved pronto!', en: 'Come back soon!', concepts: ['v.volver'], level: 'A2', topics: ['social'] },
  { id: 's.i61', es: '¡Vuelvan cuando quieran!', en: 'Come back whenever you like!', concepts: ['v.volver'], level: 'B1', topics: ['social'] },

  // --- pensar --------------------------------------------------------------
  { id: 's.i62', es: '¡Piensa antes de contestar!', en: 'Think before you answer!', concepts: ['v.pensar'], level: 'A2', topics: ['opinions'] },
  { id: 's.i63', es: '¡Piense en lo que le conviene!', en: 'Think about what suits you!', concepts: ['v.pensar'], level: 'B1', topics: ['opinions'] },
  { id: 's.i64', es: '¡Pensemos en algo mejor!', en: "Let's think of something better!", concepts: ['v.pensar'], level: 'B1', topics: ['opinions'] },
  { id: 's.i65', es: '¡Pensad un momento y decidme!', en: 'Have a think and tell me!', concepts: ['v.pensar'], level: 'B1', topics: ['opinions'] },
  { id: 's.i66', es: '¡Piensen en el resto del equipo!', en: 'Think about the rest of the team!', concepts: ['v.pensar'], level: 'B1', topics: ['work'] },

  // --- jugar ---------------------------------------------------------------
  { id: 's.i67', es: '¡Juega tranquilo, es solo un partido!', en: 'Play calmly, it is only a match!', concepts: ['v.jugar'], level: 'A2', topics: ['hobbies'] },
  { id: 's.i68', es: '¡Juegue con nosotros esta tarde!', en: 'Play with us this afternoon!', concepts: ['v.jugar'], level: 'B1', topics: ['hobbies'] },
  { id: 's.i69', es: '¡Juguemos otra partida!', en: "Let's play another round!", concepts: ['v.jugar'], level: 'A2', topics: ['hobbies'] },
  { id: 's.i70', es: '¡Jugad en el jardín, no dentro!', en: 'Play in the garden, not inside!', concepts: ['v.jugar', 'v.jardin'], level: 'A2', topics: ['home'] },
  { id: 's.i71', es: '¡Jueguen limpio!', en: 'Play fair!', concepts: ['v.jugar'], level: 'B1', topics: ['hobbies'] },

  // --- contar --------------------------------------------------------------
  { id: 's.i72', es: '¡Cuenta qué pasó!', en: 'Tell us what happened!', concepts: ['v.contar', 'v.pasar'], level: 'A2', topics: ['storytelling'] },
  { id: 's.i73', es: '¡Cuente con nosotros para lo que sea!', en: 'Count on us for anything!', concepts: ['v.contar'], level: 'B1', topics: ['social'] },
  { id: 's.i74', es: '¡Contemos hasta diez y respiramos!', en: "Let's count to ten and breathe!", concepts: ['v.contar'], level: 'B1', topics: ['feelings'] },
  { id: 's.i75', es: '¡Contad lo que visteis!', en: 'Tell us what you saw!', concepts: ['v.contar'], level: 'B1', topics: ['storytelling'] },
  { id: 's.i76', es: '¡Cuenten conmigo!', en: 'Count me in!', concepts: ['v.contar'], level: 'B1', topics: ['social'] },

  // --- dejar ---------------------------------------------------------------
  { id: 's.i77', es: '¡Deja el móvil en la mesa!', en: 'Leave your phone on the table!', concepts: ['v.dejar'], level: 'A2', topics: ['home'] },
  { id: 's.i78', es: '¡Deje el abrigo en la entrada!', en: 'Leave your coat by the entrance!', concepts: ['v.dejar', 'v.abrigo'], level: 'A2', topics: ['home'] },
  { id: 's.i79', es: '¡Dejemos esto para mañana!', en: "Let's leave this for tomorrow!", concepts: ['v.dejar'], level: 'A2', topics: ['work'] },
  { id: 's.i80', es: '¡Dejad las bicis fuera!', en: 'Leave the bikes outside!', concepts: ['v.dejar', 'v.bici'], level: 'A2', topics: ['transport'] },
  { id: 's.i81', es: '¡Dejen sitio para los demás!', en: 'Leave room for the others!', concepts: ['v.dejar'], level: 'B1', topics: ['social'] },
];
