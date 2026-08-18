import type { Story } from '@/content/types';

/**
 * Stories are read scene by scene with the English hidden until tapped, and a
 * comprehension question between scenes. They are written to be genuinely worth
 * finishing — the language is the vehicle, not the subject.
 */
export const stories: Story[] = [
  {
    id: 'story.malentendido',
    title: 'El equívoco',
    blurb:
      'Un correo mal leído, dos personas educadísimas y una semana de conversación cruzada. Nadie miente; nadie se entiende.',
    icon: 'chatbox-ellipses-outline',
    level: 'C2',
    topics: ['work', 'social'],
    concepts: ['g.audience', 'p.dar-por-sentado', 'p.andarse-con-rodeos', 'v.escueto'],
    scenes: [
      {
        lines: [
          {
            es: 'El lunes Marta escribió: «Cuando puedas, échale un vistazo al presupuesto.»',
            en: 'On Monday Marta wrote: “Have a look at the budget when you get a chance.”',
          },
          {
            es: 'Javier lo leyó como lo que era: una petición sin prisa. Lo dejó para el jueves.',
            en: 'Javier read it as exactly what it was: an unhurried request. He left it for Thursday.',
          },
          {
            es: 'Marta, que llevaba tres días esperando, lo leyó como lo que ella había querido decir: hoy.',
            en: 'Marta, who had been waiting three days, read it as what she had meant: today.',
          },
        ],
        question: {
          question: '¿De dónde nace el malentendido?',
          questionEs: '¿De dónde nace el malentendido?',
          options: [
            'De que «cuando puedas» atenúa tanto la petición que borra la urgencia',
            'De que Javier no leyó el correo',
            'De que Marta escribió el correo en un registro demasiado formal',
            'De que el presupuesto no estaba terminado',
          ],
          answer: 0,
          explanation:
            'La cortesía española atenúa por defecto. «Cuando puedas» significa "sin prisa" salvo que el contexto diga lo contrario — y aquí no lo decía.',
        },
      },
      {
        lines: [
          {
            es: 'El jueves Javier respondió, escueto: «Revisado. Un par de cosas no me cuadran.»',
            en: 'On Thursday Javier replied, tersely: “Reviewed. A couple of things don’t add up.”',
          },
          {
            es: 'Marta leyó «un par de cosas no me cuadran» y entendió: está todo mal.',
            en: 'Marta read “a couple of things don’t add up” and understood: it’s all wrong.',
          },
          {
            es: 'Javier había querido decir, literalmente, que había dos cifras que no entendía.',
            en: 'Javier had meant, literally, that there were two figures he didn’t understand.',
          },
        ],
        question: {
          question: '¿Qué convierte «un par de cosas no me cuadran» en un problema?',
          questionEs: '¿Qué convierte «un par de cosas no me cuadran» en un problema?',
          options: [
            'Que es tan escueto que el lector rellena el hueco con lo que teme',
            'Que contiene un error gramatical',
            'Que Javier usa un registro demasiado coloquial',
            'Que Marta no conoce la expresión',
          ],
          answer: 0,
          explanation:
            'No hay nada incorrecto en la frase. Es la brevedad la que deja sitio a la interpretación más pesimista.',
        },
      },
      {
        lines: [
          {
            es: 'Siguieron cuatro correos más, cada uno más cortés y menos claro que el anterior.',
            en: 'Four more emails followed, each more courteous and less clear than the last.',
          },
          {
            es: 'Ninguno de los dos preguntó lo evidente. Habría bastado con: «¿A qué cifras te refieres?»',
            en: 'Neither of them asked the obvious thing. “Which figures do you mean?” would have done it.',
          },
          {
            es: 'El viernes se cruzaron en la máquina de café y lo resolvieron en cuarenta segundos.',
            en: 'On Friday they ran into each other at the coffee machine and sorted it out in forty seconds.',
          },
        ],
        question: {
          question: '¿Qué sugiere el desenlace sobre los cuatro correos?',
          questionEs: '¿Qué sugiere el desenlace sobre los cuatro correos?',
          options: [
            'Que la cortesía excesiva alargó un problema que una pregunta directa cerraba',
            'Que el correo electrónico no sirve para el trabajo',
            'Que Javier tenía razón desde el principio',
            'Que Marta debería haber escrito en registro informal',
          ],
          answer: 0,
          explanation:
            'El contraste está en los números: cuatro correos frente a cuarenta segundos. Cada uno «más cortés y menos claro» — la ironía va en esa pareja de adjetivos.',
        },
      },
    ],
  },
  {
    id: 'story.carta',
    title: 'Carta al director',
    blurb:
      'Un vecino escribe al periódico sobre las obras de su calle. Dice estar encantado. No lo está.',
    icon: 'newspaper-outline',
    level: 'C1',
    topics: ['opinions', 'city'],
    concepts: ['p.pues-si-que', 'p.encima', 'p.por-si-fuera-poco', 'p.irse-por-las-ramas'],
    scenes: [
      {
        lines: [
          {
            es: 'Quisiera felicitar públicamente al Ayuntamiento por las obras de mi calle, que cumplen ya su decimocuarto mes.',
            en: 'I should like to publicly congratulate the Council on the works in my street, now in their fourteenth month.',
          },
          {
            es: 'Catorce meses. Se dice pronto.',
            en: 'Fourteen months. Easily said.',
          },
          {
            es: 'Entiendo que un proyecto de esta índole requiere tiempo, y no seré yo quien discuta el criterio de los técnicos.',
            en: 'I understand a project of this nature takes time, and it will not be me who questions the experts’ judgement.',
          },
        ],
        question: {
          question: '¿Cuál es la actitud real del autor?',
          questionEs: '¿Cuál es la actitud real del autor?',
          options: [
            'Está molesto, aunque escribe como si estuviera agradecido',
            'Está sinceramente agradecido con el Ayuntamiento',
            'Le da igual el asunto de las obras',
            'Defiende a los técnicos frente a sus vecinos',
          ],
          answer: 0,
          explanation:
            '«Catorce meses. Se dice pronto.» rompe el tono formal — la felicitación es irónica desde la primera línea.',
        },
      },
      {
        lines: [
          {
            es: 'Agradezco especialmente el detalle de empezar a taladrar a las siete de la mañana los sábados.',
            en: 'I am especially grateful for the thoughtful touch of starting the drilling at seven on Saturday mornings.',
          },
          {
            es: 'Y encima, por si fuera poco, han tenido la delicadeza de no avisar a nadie.',
            en: 'And on top of that, as if that weren’t enough, they had the courtesy not to warn anybody.',
          },
          {
            es: 'Dicho esto, reconozco que la calle quedará muy bien. Cuando quede.',
            en: 'That said, I accept the street will look very good. When it is finished.',
          },
        ],
        question: {
          question: '¿Qué función cumple «Cuando quede.» al final del párrafo?',
          questionEs: '¿Qué función cumple «Cuando quede.» al final del párrafo?',
          options: [
            'Retira la concesión que acababa de hacer',
            'Fija una fecha concreta de finalización',
            'Reconoce que las obras van bien',
            'Cambia de tema hacia otra calle',
          ],
          answer: 0,
          explanation:
            'Concede algo («quedará muy bien») y acto seguido lo desmonta con el subjuntivo, que deja el final abierto e improbable.',
        },
      },
      {
        lines: [
          {
            es: 'No es que pretenda molestar a nadie. Es que llevo un año durmiendo con tapones.',
            en: 'It is not that I wish to trouble anyone. It is that I have spent a year sleeping with earplugs.',
          },
          {
            es: 'Alguno dirá que me voy por las ramas y que una carta no arregla una acera.',
            en: 'Some will say I am going off on a tangent and that a letter does not fix a pavement.',
          },
          {
            es: 'Tendrán razón. Pero, hasta cierto punto, escribirla ya me ha servido de algo.',
            en: 'They will be right. But, up to a point, writing it has already done me some good.',
          },
        ],
        question: {
          question: '¿Qué hace el autor en la última frase?',
          questionEs: '¿Qué hace el autor en la última frase?',
          options: [
            'Concede la crítica y aun así defiende el gesto de escribir',
            'Se retracta de todo lo dicho anteriormente',
            'Exige una respuesta oficial del Ayuntamiento',
            'Anuncia que dejará de quejarse',
          ],
          answer: 0,
          explanation:
            '«Tendrán razón. Pero…, hasta cierto punto…» — concede primero y matiza después, sin renunciar a su postura.',
        },
      },
    ],
  },
  {
    id: 'story.vivienda',
    title: 'Lo que cuesta quedarse',
    blurb:
      'Una columna de opinión sobre el precio de la vivienda. Larga, con argumento, y no del todo imparcial.',
    icon: 'newspaper-outline',
    level: 'B2',
    topics: ['opinions', 'home', 'city'],
    concepts: ['v.vivienda', 'v.alquiler', 'p.a-pesar-de', 'p.por-un-lado', 'v.medida'],
    scenes: [
      {
        lines: [
          {
            es: 'Mi abuela pagaba por su piso, en 1974, lo que hoy cuesta una cena para dos en el centro.',
            en: 'In 1974 my grandmother paid for her flat what a dinner for two in the centre costs today.',
          },
          {
            es: 'No lo cuento por nostalgia. Lo cuento porque ese piso sigue siendo el mismo piso, en la misma calle, y hoy nadie de mi edad podría alquilarlo.',
            en: 'I don’t say it out of nostalgia. I say it because that flat is still the same flat, on the same street, and today nobody my age could rent it.',
          },
          {
            es: 'Según los últimos datos, el alquiler medio se ha comido casi la mitad del sueldo medio.',
            en: 'According to the latest figures, average rent has swallowed almost half the average salary.',
          },
        ],
        question: {
          question: 'What is the writer’s point in mentioning her grandmother?',
          questionEs: '¿Para qué menciona a su abuela?',
          options: [
            'To contrast what housing cost then with what it costs now',
            'To explain why she moved to the city',
            'To argue that old flats are better built',
            'To complain that restaurants are expensive',
          ],
          answer: 0,
          explanation:
            'She says explicitly: «No lo cuento por nostalgia» — the comparison is about price, not sentiment.',
        },
      },
      {
        lines: [
          {
            es: 'Por un lado, están los que dicen que el problema es la falta de oferta: hay que construir más, y punto.',
            en: 'On one hand, there are those who say the problem is lack of supply: build more, end of story.',
          },
          {
            es: 'Por otro, los que sostienen que no se trata de cuántas casas hay, sino de quién las compra y para qué.',
            en: 'On the other, those who maintain it isn’t about how many houses there are, but who buys them and what for.',
          },
          {
            es: 'A mí, la verdad, ninguna de las dos explicaciones me convence del todo por separado.',
            en: 'Honestly, neither explanation convinces me entirely on its own.',
          },
        ],
        question: {
          question: 'What position does the writer take on the two explanations?',
          questionEs: '¿Qué postura adopta ante las dos explicaciones?',
          options: [
            'She finds neither fully convincing on its own',
            'She fully agrees with the supply argument',
            'She thinks both are completely wrong',
            'She refuses to take any position',
          ],
          answer: 0,
          explanation:
            '«Ninguna de las dos me convence del todo por separado» — not a rejection, a partial agreement with both.',
        },
      },
      {
        lines: [
          {
            es: 'A pesar de que se han aprobado varias medidas en los últimos años, los precios siguen subiendo.',
            en: 'Despite several measures having been approved in recent years, prices keep rising.',
          },
          {
            es: 'Puede que hagan falta años para notar el efecto. Puede también que las medidas fueran, sencillamente, insuficientes.',
            en: 'It may be that it takes years to see the effect. It may also be that the measures were simply insufficient.',
          },
          {
            es: 'Si yo tuviera que apostar, apostaría por lo segundo.',
            en: 'If I had to bet, I’d bet on the latter.',
          },
        ],
        question: {
          question: 'How certain is the writer about why the measures have not worked?',
          questionEs: '¿Hasta qué punto está segura de por qué no han funcionado las medidas?',
          options: [
            'She offers two possibilities and leans towards one without asserting it',
            'She states plainly that the measures were sabotaged',
            'She is completely certain they need more time',
            'She says the measures have in fact worked',
          ],
          answer: 0,
          explanation:
            '«Puede que… puede también que…» hedges both ways; «si tuviera que apostar» signals a preference, not a claim.',
        },
      },
      {
        lines: [
          {
            es: 'Al final la pregunta no es económica, o no solo. Es quién puede permitirse quedarse en el barrio donde creció.',
            en: 'In the end the question isn’t economic, or not only. It’s who can afford to stay in the neighbourhood where they grew up.',
          },
          {
            es: 'Mi abuela sigue en su piso. Yo, en el mismo barrio, voy por el cuarto alquiler en seis años.',
            en: 'My grandmother is still in her flat. I, in the same neighbourhood, am on my fourth rental in six years.',
          },
        ],
        question: {
          question: 'What is implied by the final sentence?',
          questionEs: '¿Qué da a entender la última frase?',
          options: [
            'That the writer’s own housing is unstable in a way her grandmother’s never was',
            'That the writer is about to move away from the city',
            'That her grandmother is planning to sell the flat',
            'That rents in the neighbourhood have finally stopped rising',
          ],
          answer: 0,
          explanation:
            'The contrast is left unstated — «sigue en su piso» against «voy por el cuarto alquiler». The argument lands by implication, not assertion.',
        },
      },
    ],
  },
  {
    id: 'story.barrio',
    title: 'La panadería de la esquina',
    blurb: 'Your first errand in a new neighbourhood, and nobody uses street names.',
    icon: 'navigate-outline',
    level: 'A1',
    topics: ['city', 'directions', 'greetings'],
    concepts: ['p.donde-esta', 'v.derecha', 'v.izquierda', 'v.recto', 'v.este', 'v.cerca'],
    scenes: [
      {
        lines: [
          {
            es: 'Es sábado por la mañana. Vivo aquí desde el lunes y no conozco nada.',
            en: 'It’s Saturday morning. I’ve lived here since Monday and I don’t know anything.',
          },
          {
            es: 'Mi compañera de piso quiere pan. Yo quiero un café.',
            en: 'My flatmate wants bread. I want a coffee.',
          },
          {
            es: 'En la calle hay una señora mayor con un perro pequeño.',
            en: 'On the street there’s an elderly lady with a small dog.',
          },
        ],
        question: {
          question: 'Why is the narrator going out?',
          options: [
            'To buy bread and get a coffee',
            'To walk the dog',
            'To meet their flatmate at work',
            'To look for a new flat',
          ],
          answer: 0,
          explanation: 'Mi compañera quiere pan, yo quiero un café — bread and a coffee.',
        },
      },
      {
        lines: [
          { speaker: 'Yo', es: 'Perdona, ¿dónde está la panadería?', en: 'Excuse me, where is the bakery?' },
          {
            speaker: 'Señora',
            es: '¿La panadería? Está muy cerca. Todo recto y luego a la derecha.',
            en: 'The bakery? It’s very close. Straight on and then right.',
          },
          {
            speaker: 'Señora',
            es: 'Está al lado de la farmacia. Hay una plaza pequeña.',
            en: 'It’s next to the pharmacy. There’s a small square.',
          },
          { speaker: 'Yo', es: 'Vale, muchas gracias.', en: 'Okay, thank you very much.' },
        ],
        question: {
          question: 'Which way does she send him?',
          questionEs: '¿Por dónde tiene que ir?',
          options: [
            'Straight on, then right',
            'Straight on, then left',
            'Left, then straight on',
            'Right, then left',
          ],
          answer: 0,
          explanation: 'Todo recto y luego a la derecha — straight on, then right.',
        },
      },
      {
        lines: [
          { es: 'Voy todo recto. Hay una plaza. Hay una farmacia.', en: 'I go straight on. There’s a square. There’s a pharmacy.' },
          { es: 'Pero la panadería no está aquí. Está cerrada.', en: 'But the bakery isn’t here. It’s closed.' },
          {
            es: 'En la puerta hay un papel: «Cerrado en agosto. Hasta septiembre.»',
            en: 'On the door there’s a note: “Closed in August. Back in September.”',
          },
          {
            es: 'Claro. Es agosto. Toda España está de vacaciones.',
            en: 'Of course. It’s August. All of Spain is on holiday.',
          },
        ],
        question: {
          question: 'Why is the bakery shut?',
          questionEs: '¿Por qué está cerrada la panadería?',
          options: [
            'It closes for the whole of August',
            'It only opens in the afternoon',
            'It has moved to another street',
            'It is closed on Saturdays',
          ],
          answer: 0,
          explanation:
            'Cerrado en agosto — August is when much of Spain shuts down and goes on holiday.',
        },
      },
      {
        lines: [
          { es: 'Vuelvo a casa sin pan, pero con un café del bar de la esquina.', en: 'I go home without bread, but with a coffee from the bar on the corner.' },
          { speaker: 'Compañera', es: '¿Y el pan?', en: 'And the bread?' },
          { speaker: 'Yo', es: 'Es agosto.', en: 'It’s August.' },
          { speaker: 'Compañera', es: 'Ah, claro. Bienvenido a España.', en: 'Ah, of course. Welcome to Spain.' },
        ],
      },
    ],
  },
  {
    id: 'story.metro',
    title: 'El último metro',
    blurb: 'It is 1:40am, you are three stops from home, and the metro has other ideas.',
    icon: 'subway-outline',
    level: 'A2',
    topics: ['transport', 'city', 'social'],
    concepts: ['v.metro', 'v.coger', 'g.preterite', 'v.tarde'],
    scenes: [
      {
        lines: [
          {
            es: 'Son la una y media de la mañana. Estoy en Sol con Marta y Álvaro.',
            en: 'It’s half past one in the morning. I’m at Sol with Marta and Álvaro.',
          },
          {
            speaker: 'Marta',
            es: 'Oye, ¿a qué hora es el último metro?',
            en: 'Hey, what time is the last metro?',
          },
          {
            speaker: 'Álvaro',
            es: 'Tranquilos, hay hasta la una y media.',
            en: 'Relax, they run until half one.',
          },
          { es: 'Miro el móvil. Es la una y treinta y cinco.', en: 'I look at my phone. It’s 1:35.' },
        ],
        question: {
          question: 'What is the problem?',
          options: [
            'They have already missed the last metro',
            'Marta does not want to go home',
            'The metro is closed for works',
            'Álvaro has lost his wallet',
          ],
          answer: 0,
          explanation: 'Álvaro says trains run until 1:30 — and it is already 1:35.',
        },
      },
      {
        lines: [
          { speaker: 'Marta', es: '¡Álvaro! Son y treinta y cinco.', en: 'Álvaro! It’s thirty-five past.' },
          { speaker: 'Álvaro', es: 'Ah. Pues nada.', en: 'Ah. Oh well.' },
          {
            es: 'Corremos igual. Bajamos las escaleras y las puertas están cerradas.',
            en: 'We run anyway. We go down the stairs and the doors are closed.',
          },
          {
            speaker: 'Marta',
            es: 'Qué rollo, tío. ¿Cogemos un taxi?',
            en: 'What a drag, mate. Shall we get a taxi?',
          },
        ],
        question: {
          question: 'What does Marta suggest?',
          questionEs: '¿Qué propone Marta?',
          options: ['Walking home', 'Taking a taxi', 'Waiting for the first metro', 'Going back to the bar'],
          answer: 1,
          explanation: '"¿Cogemos un taxi?" — in Spain you coger a taxi.',
        },
      },
      {
        lines: [
          { es: 'Álvaro mira su cartera. No tiene nada.', en: 'Álvaro looks in his wallet. He has nothing.' },
          {
            speaker: 'Álvaro',
            es: 'Es que me he gastado todo en las cañas.',
            en: 'The thing is I spent it all on the beers.',
          },
          {
            speaker: 'Marta',
            es: 'Claro que sí. Venga, andando. Son cuarenta minutos.',
            en: 'Of course you did. Come on, we walk. It’s forty minutes.',
          },
          {
            es: 'Y así, a las dos y cuarto de la mañana, cruzamos Madrid andando.',
            en: 'And so, at quarter past two in the morning, we walk across Madrid.',
          },
        ],
        question: {
          question: 'Why can’t they take a taxi?',
          questionEs: '¿Por qué no cogen un taxi?',
          options: [
            'There are no taxis at that hour',
            'Álvaro has spent all his money',
            'Marta prefers to walk',
            'The taxi driver refused',
          ],
          answer: 1,
          explanation: '"Me he gastado todo en las cañas" — he spent it all on beer.',
        },
      },
      {
        lines: [
          {
            es: 'Llegamos a casa a las tres. Me duelen los pies.',
            en: 'We get home at three. My feet hurt.',
          },
          {
            speaker: 'Álvaro',
            es: 'Ha estado bien, ¿no?',
            en: 'That was good, wasn’t it?',
          },
          { es: 'Y lo peor es que sí.', en: 'And the worst part is that it was.' },
        ],
        question: {
          question: 'What does "me duelen los pies" mean?',
          questionEs: '¿Qué significa "me duelen los pies"?',
          options: ['My feet hurt', 'I lost my shoes', 'I am walking fast', 'My feet are cold'],
          answer: 0,
          explanation: 'Doler works like gustar — the feet do the hurting, to me.',
        },
      },
    ],
  },

  {
    id: 'story.direccion',
    title: 'La dirección equivocada',
    blurb: 'Your friend invites you over. Your friend is bad at addresses.',
    icon: 'navigate-outline',
    level: 'B1',
    topics: ['directions', 'social', 'city'],
    concepts: ['v.calle', 'g.preterite', 'g.imperfect', 'v.piso'],
    scenes: [
      {
        lines: [
          {
            es: 'Marta me escribió el jueves: «Cena en mi casa el sábado. Calle Olivar, 15, tercero.»',
            en: 'Marta wrote to me on Thursday: "Dinner at mine on Saturday. Calle Olivar, 15, third floor."',
          },
          {
            es: 'El sábado llegué a las nueve con una botella de vino.',
            en: 'On Saturday I arrived at nine with a bottle of wine.',
          },
          { es: 'Llamé al tercero. Abrió un señor de unos setenta años.', en: 'I rang the third floor. A man of about seventy opened.' },
        ],
        question: {
          question: 'Who opened the door?',
          questionEs: '¿Quién abrió la puerta?',
          options: ['Marta', 'An older man', 'Nobody', 'Álvaro'],
          answer: 1,
        },
      },
      {
        lines: [
          { speaker: 'Señor', es: '¿Sí? ¿Qué quería?', en: 'Yes? What did you want?' },
          {
            es: 'Le dije que venía a cenar con Marta. Se quedó mirándome.',
            en: 'I told him I was coming for dinner with Marta. He just looked at me.',
          },
          { speaker: 'Señor', es: 'Aquí no vive ninguna Marta, hijo.', en: 'No Marta lives here, son.' },
          {
            es: 'Miré el móvil otra vez. Calle Olivar. Pero había dos: una en Lavapiés y otra en Chamberí.',
            en: 'I checked my phone again. Calle Olivar. But there were two: one in Lavapiés and one in Chamberí.',
          },
        ],
        question: {
          question: 'What went wrong?',
          questionEs: '¿Cuál fue el problema?',
          options: [
            'Marta gave the wrong day',
            'There are two streets with the same name',
            'The building number was wrong',
            'He forgot the wine',
          ],
          answer: 1,
          explanation: '"Había dos" — there were two Calle Olivar, in different neighbourhoods.',
        },
      },
      {
        lines: [
          {
            es: 'El señor me vio la cara y se rió.',
            en: 'The man saw my face and laughed.',
          },
          {
            speaker: 'Señor',
            es: 'Anda, pasa y llámala desde aquí. Y deja el vino, que pesa.',
            en: 'Go on, come in and call her from here. And put the wine down, it’s heavy.',
          },
          {
            es: 'Cuarenta minutos después seguía en su salón, tomando un vermut y hablando del Atleti.',
            en: 'Forty minutes later I was still in his living room, drinking a vermouth and talking about Atlético.',
          },
          {
            es: 'Llegué a la cena a las once. Nadie se sorprendió.',
            en: 'I got to the dinner at eleven. Nobody was surprised.',
          },
        ],
        question: {
          question: 'Why does "seguía en su salón" use the imperfect?',
          options: [
            'It describes an ongoing situation, not a finished event',
            'It happened a long time ago',
            'It is a habit that repeats',
            'Seguir is always imperfect',
          ],
          answer: 0,
          explanation: 'The imperfect paints the scene; the preterite (llegué) reports the events.',
        },
      },
    ],
  },
// --- A1: reading that is a sign, a menu or a message ---------------------
  {
    id: 'story.menu',
    title: 'La pizarra del bar',
    blurb: 'El menú del día está escrito a mano en una pizarra. Nueve euros, y hay que elegir rápido.',
    icon: 'restaurant-outline',
    level: 'A1',
    topics: ['cafe', 'food', 'numbers'],
    concepts: ['v.comer', 'v.beber', 'p.la-cuenta-porfa'],
    scenes: [
      {
        lines: [
          { es: 'MENÚ DEL DÍA — 9,50 €', en: 'SET MENU — €9.50' },
          { es: 'Primero: ensalada, sopa o lentejas.', en: 'First course: salad, soup or lentils.' },
          { es: 'Segundo: pollo, merluza o tortilla.', en: 'Second course: chicken, hake or omelette.' },
          { es: 'Postre o café. Pan y bebida incluidos.', en: 'Dessert or coffee. Bread and a drink included.' },
        ],
        question: {
          question: 'You want soup, chicken and a coffee. Is that possible for €9.50?',
          options: [
            'Yes — one first course, one second course and a coffee are all included',
            'No, because coffee costs extra',
            'No, because you cannot have soup as a first course',
            'Yes, but you have to pay extra for bread',
          ],
          answer: 0,
          explanation:
            'The menú del día is a fixed price: one dish from each list, plus dessert or coffee, with bread and a drink included. It is the cheapest way to eat well in Spain.',
        },
      },
      {
        lines: [
          { es: 'Camarero: —¿De primero?', en: 'Waiter: “First course?”' },
          { es: '—Sopa, por favor.', en: '“Soup, please.”' },
          { es: '—¿Y de segundo?', en: '“And second?”' },
          { es: '—Pollo. Y de beber, agua.', en: '“Chicken. And to drink, water.”' },
          { es: '—Muy bien. ¿Postre o café?', en: '“Very good. Dessert or coffee?”' },
        ],
        question: {
          question: 'What does the waiter still need to know?',
          options: [
            'Whether you want dessert or coffee',
            'What you want to drink',
            'Which first course you want',
            'Whether you are paying by card',
          ],
          answer: 0,
          explanation:
            'Postre o café — it is one or the other, not both. The drink was already settled with "de beber, agua".',
        },
      },
    ],
  },
  {
    id: 'story.mensaje',
    title: 'Tres mensajes y un cambio de plan',
    blurb: 'Quedasteis a las ocho. Son las siete y media y el móvil vibra tres veces seguidas.',
    icon: 'chatbubbles-outline',
    level: 'A1',
    topics: ['time', 'plans', 'social'],
    concepts: ['v.quedar', 'v.hora', 'v.tarde'],
    scenes: [
      {
        lines: [
          { speaker: 'Ana', es: '¿Estás ya de camino?', en: 'Are you on your way yet?' },
          { speaker: 'Ana', es: 'Es que voy a llegar tarde, lo siento 😕', en: 'It’s just that I’m going to be late, sorry 😕' },
          { speaker: 'Ana', es: '¿Quedamos mejor a las nueve? En el mismo sitio.', en: 'Shall we make it nine instead? Same place.' },
        ],
        question: {
          question: 'What is Ana asking for?',
          options: [
            'To meet an hour later, in the same place',
            'To meet in a different place at eight',
            'To cancel completely',
            'To meet half an hour earlier',
          ],
          answer: 0,
          explanation:
            'The plan was eight; she proposes nine — en el mismo sitio confirms the place is unchanged.',
        },
      },
      {
        lines: [
          { speaker: 'Tú', es: 'Vale, no pasa nada. A las nueve entonces.', en: 'Okay, no worries. Nine then.' },
          { speaker: 'Ana', es: '¡Gracias! Eres un sol. Hasta ahora 😊', en: 'Thanks! You’re a star. See you shortly 😊' },
        ],
        question: {
          question: 'Ana ends with "hasta ahora". What does that tell you?',
          options: [
            'She will see you very soon, today',
            'She is saying goodbye until next week',
            'She has cancelled after all',
            'She is asking you to reply again',
          ],
          answer: 0,
          explanation:
            'hasta ahora is only used when you are about to see the person shortly. hasta luego is the general goodbye; hasta mañana is tomorrow.',
        },
      },
    ],
  },
  {
    id: 'story.cartel',
    title: 'Se busca',
    blurb: 'Un cartel pegado en la puerta del portal. Alguien ha perdido a alguien — o a algo.',
    icon: 'person-outline',
    level: 'A1',
    topics: ['describing', 'people', 'home'],
    concepts: ['v.alto', 'v.moreno', 'v.pelo', 'g.adjective-agreement'],
    scenes: [
      {
        lines: [
          { es: '¿HAS VISTO A LUNA?', en: 'HAVE YOU SEEN LUNA?' },
          { es: 'Es pequeña, blanca y muy tranquila.', en: 'She is small, white and very calm.' },
          { es: 'Tiene los ojos verdes y una mancha negra en la oreja.', en: 'She has green eyes and a black patch on her ear.' },
          { es: 'Si la ves, llama al 611 22 33 44. ¡Gracias!', en: 'If you see her, call 611 22 33 44. Thank you!' },
        ],
        question: {
          question: 'What are we looking for?',
          options: [
            'An animal — the description is of size, colour and markings, not clothes or a job',
            'A tall dark-haired woman',
            'A lost set of keys',
            'A child who lives in the building',
          ],
          answer: 0,
          explanation:
            'una mancha negra en la oreja — a patch on the ear. Spanish uses exactly the same adjectives for pets as for people, so the clue is what is being described, not how.',
        },
      },
      {
        lines: [
          { es: 'Debajo, alguien ha escrito a mano:', en: 'Underneath, somebody has written by hand:' },
          { es: '«La vi el martes en el patio. Estaba bien.»', en: '“I saw her on Tuesday in the courtyard. She was fine.”' },
          { es: '«Creo que vive en el tercero.»', en: '“I think she lives on the third floor.”' },
        ],
        question: {
          question: 'What does the handwritten note add?',
          options: [
            'A sighting on Tuesday and a guess about where she lives',
            'A phone number to call',
            'A description of her eyes',
            'A reward for finding her',
          ],
          answer: 0,
          explanation:
            'la vi el martes places the sighting in the past; creo que vive marks the second line as a guess, not a fact.',
        },
      },
    ],
  },

  // --- A2: everyday written Spanish ----------------------------------------
  {
    id: 'story.correo-piso',
    title: 'Un correo sobre el piso',
    blurb: 'Has escrito preguntando por un piso. La respuesta llega con más condiciones de las esperadas.',
    icon: 'home-outline',
    level: 'A2',
    topics: ['home', 'city'],
    concepts: ['v.piso', 'v.alquiler', 'v.caro'],
    scenes: [
      {
        lines: [
          { es: 'Hola, buenas tardes:', en: 'Hello, good afternoon:' },
          { es: 'El piso sigue libre, pero hay dos cosas que decirle antes.', en: 'The flat is still available, but there are two things to tell you first.' },
          { es: 'Son 950 € al mes, más 80 € de gastos de comunidad.', en: 'It’s €950 a month, plus €80 in building fees.' },
          { es: 'Además, pedimos dos meses de fianza por adelantado.', en: 'We also ask for two months’ deposit in advance.' },
        ],
        question: {
          question: 'What do you actually pay every month?',
          options: ['€1,030', '€950', '€1,900', '€80'],
          answer: 0,
          explanation:
            '950 + 80 = 1030. The fianza is a one-off deposit, not a monthly cost — gastos de comunidad, however, recur every month and are very often quoted separately in Spain.',
        },
      },
      {
        lines: [
          { es: 'El piso está en un cuarto sin ascensor, eso sí.', en: 'The flat is on the fourth floor with no lift, mind you.' },
          { es: 'Pero es exterior, muy luminoso y da a una plaza tranquila.', en: 'But it’s an outside flat, very bright, and looks onto a quiet square.' },
          { es: 'Si le interesa, podemos verlo el jueves por la tarde.', en: 'If you’re interested, we can see it on Thursday afternoon.' },
        ],
        question: {
          question: 'What is the drawback the writer admits?',
          options: [
            'Four floors with no lift',
            'It is dark inside',
            'It faces a noisy street',
            'It is only free from next year',
          ],
          answer: 0,
          explanation:
            'eso sí flags the concession — "mind you". Everything after it (exterior, luminoso, plaza tranquila) is the compensating good news.',
        },
      },
    ],
  },
  {
    id: 'story.aviso-metro',
    title: 'Aviso en la estación',
    blurb: 'Un cartel en la entrada del metro. Tienes que llegar al aeropuerto en cuarenta minutos.',
    icon: 'subway-outline',
    level: 'A2',
    topics: ['transport', 'travel', 'directions'],
    concepts: ['v.metro', 'v.estacion', 'v.retraso'],
    scenes: [
      {
        lines: [
          { es: 'AVISO A LOS VIAJEROS', en: 'NOTICE TO PASSENGERS' },
          { es: 'Por obras, la línea 8 está cortada entre Nuevos Ministerios y Barajas.', en: 'Due to works, line 8 is closed between Nuevos Ministerios and Barajas.' },
          { es: 'Hay un servicio especial de autobús cada 10 minutos desde la salida principal.', en: 'There is a special bus service every 10 minutes from the main exit.' },
          { es: 'Disculpen las molestias.', en: 'We apologise for the inconvenience.' },
        ],
        question: {
          question: 'How do you get to the airport now?',
          options: [
            'Take the replacement bus from the main exit',
            'Take line 8 as normal, it is only delayed',
            'Walk to Barajas',
            'Wait at the platform for a special train',
          ],
          answer: 0,
          explanation:
            'cortada means the section is closed, not delayed. servicio especial de autobús is the replacement.',
        },
      },
      {
        lines: [
          { es: 'Un empleado te ve leyendo el cartel.', en: 'A member of staff sees you reading the notice.' },
          { es: '—¿Va al aeropuerto? Pues corra, que el bus sale ahora.', en: '“Are you going to the airport? Then hurry, the bus is leaving now.”' },
          { es: '—Tarda unos veinte minutos, con tráfico puede que media hora.', en: '“It takes about twenty minutes, with traffic maybe half an hour.”' },
        ],
        question: {
          question: 'With forty minutes before your flight check-in, what does he imply?',
          options: [
            'It is tight but possible if you go right now',
            'You will definitely miss it',
            'There is plenty of time, no need to rush',
            'You should take a taxi instead',
          ],
          answer: 0,
          explanation:
            'corra, que el bus sale ahora is urgency; puede que media hora leaves the margin uncomfortably thin but not impossible.',
        },
      },
    ],
  },
  {
    id: 'story.resena',
    title: 'Dos reseñas del mismo restaurante',
    blurb: 'Cinco estrellas y dos estrellas, escritas la misma semana. Las dos son sinceras.',
    icon: 'restaurant-outline',
    level: 'A2',
    topics: ['restaurant', 'opinions', 'food'],
    concepts: ['v.caro', 'p.merece-la-pena', 'v.preferir'],
    scenes: [
      {
        lines: [
          { es: '★★★★★ — «Comimos de menú y por 12 € no se puede pedir más.»', en: '★★★★★ — “We had the set menu and for €12 you can’t ask for more.”' },
          { es: '«El servicio es rápido, la comida casera y el sitio está siempre lleno.»', en: '“Service is fast, the food is home-style and the place is always full.”' },
          { es: '«Eso sí: si vas a las dos y media, esperas.»', en: '“Mind you: if you go at half two, you wait.”' },
        ],
        question: {
          question: 'What does this reviewer value most?',
          options: [
            'Value for money',
            'A quiet, empty dining room',
            'An elaborate tasting menu',
            'Being able to book a table',
          ],
          answer: 0,
          explanation:
            'por 12 € no se puede pedir más is a value judgement, and the queue is presented as a price worth paying.',
        },
      },
      {
        lines: [
          { es: '★★ — «Ruidosísimo. No oíamos nada y tardaron cuarenta minutos.»', en: '★★ — “Incredibly noisy. We couldn’t hear a thing and it took forty minutes.”' },
          { es: '«La comida está bien, pero fuimos a cenar tranquilos y salimos con dolor de cabeza.»', en: '“The food is fine, but we went for a quiet dinner and left with a headache.”' },
          { es: '«Para comer rápido al mediodía, seguramente perfecto.»', en: '“For a quick lunch at midday, probably perfect.”' },
        ],
        question: {
          question: 'Do the two reviewers actually disagree about the restaurant?',
          options: [
            'Not really — they wanted different things from the same place',
            'Yes, one says the food is bad',
            'Yes, one says it is expensive',
            'No, the second reviewer went to a different restaurant',
          ],
          answer: 0,
          explanation:
            'Both say the food is good. The second even concedes para comer rápido al mediodía, seguramente perfecto — the complaint is about fit, not quality.',
        },
      },
    ],
  },

  // --- B1: personal writing and short articles -----------------------------
  {
    id: 'story.carta-amiga',
    title: 'La carta que no envió',
    blurb: 'Marta escribió tres borradores. Este es el segundo, el único sincero.',
    icon: 'chatbox-ellipses-outline',
    level: 'B1',
    topics: ['feelings', 'social', 'past'],
    concepts: ['v.agobiado', 'p.echar-de-menos', 'p.darse-cuenta', 'g.preterite-imperfect'],
    scenes: [
      {
        lines: [
          { es: 'Sé que hace meses que no te escribo y no tengo excusa.', en: 'I know I haven’t written to you in months and I have no excuse.' },
          { es: 'Al principio era el trabajo: estaba agobiada y no levantaba cabeza.', en: 'At first it was work: I was overwhelmed and couldn’t come up for air.' },
          { es: 'Luego dejó de ser el trabajo y siguió siendo lo mismo.', en: 'Then it stopped being work and stayed the same anyway.' },
        ],
        question: {
          question: '¿Qué admite Marta en la tercera línea?',
          questionEs: '¿Qué admite Marta en la tercera línea?',
          options: [
            'Que el trabajo dejó de ser la razón real del silencio',
            'Que cambió de trabajo',
            'Que su amiga tampoco le escribió',
            'Que estuvo enferma varios meses',
          ],
          answer: 0,
          explanation:
            'dejó de ser el trabajo y siguió siendo lo mismo — el motivo cambió, la conducta no. Es una confesión, no una excusa.',
        },
      },
      {
        lines: [
          { es: 'El otro día me di cuenta de que llevaba un año contando la misma historia.', en: 'The other day I realised I had spent a year telling the same story.' },
          { es: 'Te echo de menos, y no de una manera dramática: te echo de menos los martes.', en: 'I miss you, and not dramatically: I miss you on Tuesdays.' },
          { es: 'Cuando pasa algo pequeño y no tengo a quién contárselo.', en: 'When something small happens and I have nobody to tell it to.' },
        ],
        question: {
          question: '¿Por qué dice «te echo de menos los martes»?',
          questionEs: '¿Por qué dice «te echo de menos los martes»?',
          options: [
            'Para señalar que la echa de menos en lo cotidiano, no en lo grande',
            'Porque los martes se veían siempre',
            'Porque los martes tiene el día libre',
            'Porque es el día que escribió la carta',
          ],
          answer: 0,
          explanation:
            'La frase siguiente lo explica: cuando pasa algo pequeño. Concretar un día convierte una frase gastada en algo específico y creíble.',
        },
      },
    ],
  },
  {
    id: 'story.articulo-siesta',
    title: '¿Existe todavía la siesta?',
    blurb: 'Un artículo corto sobre una costumbre que casi todo el mundo cita y casi nadie practica.',
    icon: 'newspaper-outline',
    level: 'B1',
    topics: ['city', 'opinions', 'daily-routine'],
    concepts: ['v.horario', 'v.sin-embargo', 'g.se-impersonal'],
    scenes: [
      {
        lines: [
          { es: 'Se dice que en España todo el mundo duerme la siesta. No es verdad.', en: 'People say everyone in Spain has a siesta. It isn’t true.' },
          { es: 'Menos del 20 % lo hace entre semana, y casi siempre son quince minutos.', en: 'Fewer than 20% do so on weekdays, and it’s almost always fifteen minutes.' },
          { es: 'Sin embargo, el horario español sigue organizado como si la siesta existiera.', en: 'However, the Spanish timetable is still organised as if the siesta existed.' },
        ],
        question: {
          question: '¿Cuál es la contradicción que señala el artículo?',
          questionEs: '¿Cuál es la contradicción que señala el artículo?',
          options: [
            'Casi nadie duerme la siesta, pero los horarios siguen construidos alrededor de ella',
            'Los españoles duermen más que el resto de Europa',
            'La siesta se ha prohibido en algunas ciudades',
            'Las tiendas cierran porque los empleados duermen',
          ],
          answer: 0,
          explanation:
            'sin embargo marca el giro: el hábito ha desaparecido, la estructura horaria no.',
        },
      },
      {
        lines: [
          { es: 'Muchas tiendas pequeñas cierran de dos a cinco. Las grandes, ya no.', en: 'Many small shops close from two to five. The big ones, not any more.' },
          { es: 'El resultado es un país con dos horarios distintos funcionando a la vez.', en: 'The result is a country running two different timetables at once.' },
          { es: 'Por eso se cena a las diez: no por la siesta, sino por lo que la sustituyó.', en: 'That’s why dinner is at ten: not because of the siesta, but because of what replaced it.' },
        ],
        question: {
          question: 'Según el texto, ¿por qué se cena tan tarde en España?',
          questionEs: 'Según el texto, ¿por qué se cena tan tarde en España?',
          options: [
            'Por la jornada partida que quedó cuando la siesta desapareció',
            'Porque la gente duerme la siesta por la tarde',
            'Porque los restaurantes abren tarde',
            'Porque hace demasiado calor antes',
          ],
          answer: 0,
          explanation:
            'no por la siesta, sino por lo que la sustituyó — la estructura sobrevivió a la costumbre que la justificaba.',
        },
      },
    ],
  },
  {
    id: 'story.grupo',
    title: 'El grupo de WhatsApp',
    blurb: 'Seis personas, una cena y cuarenta mensajes para decidir un día. Nadie dice que no.',
    icon: 'chatbubbles-outline',
    level: 'B1',
    topics: ['social', 'plans', 'slang'],
    concepts: ['v.quedar', 'p.no-pasa-nada', 'p.merece-la-pena', 'v.o-sea'],
    scenes: [
      {
        lines: [
          { speaker: 'Carla', es: '¿Cenamos el viernes?', en: 'Shall we have dinner on Friday?' },
          { speaker: 'Dani', es: 'Por mí genial 👌', en: 'Works for me 👌' },
          { speaker: 'Sonia', es: 'Uf, el viernes lo tengo complicado, pero no me hagáis caso.', en: 'Ugh, Friday’s tricky for me, but don’t mind me.' },
          { speaker: 'Dani', es: '¿Sábado entonces?', en: 'Saturday then?' },
          { speaker: 'Carla', es: 'El sábado yo no puedo 😅', en: 'I can’t on Saturday 😅' },
        ],
        question: {
          question: '¿Qué está haciendo Sonia con «no me hagáis caso»?',
          questionEs: '¿Qué está haciendo Sonia con «no me hagáis caso»?',
          options: [
            'Objetar sin objetar: deja constancia del problema y finge no imponerlo',
            'Confirmar que el viernes le viene bien',
            'Decir que no va a ir de ninguna manera',
            'Pedir que la saquen del grupo',
          ],
          answer: 0,
          explanation:
            'Es cortesía negativa: se señala el inconveniente y a la vez se renuncia formalmente a él. Nadie se lo cree, y precisamente por eso Dani propone el sábado.',
        },
      },
      {
        lines: [
          { speaker: 'Sonia', es: 'A ver, si es por mí, id el viernes y ya está.', en: 'Look, if it’s because of me, go on Friday and that’s that.' },
          { speaker: 'Dani', es: 'Que no, mujer, que buscamos otro día y ya.', en: 'No, come on, we’ll find another day and that’s it.' },
          { speaker: 'Carla', es: 'O sea, que jueves. ¿Jueves?', en: 'So basically Thursday. Thursday?' },
          { speaker: 'Sonia', es: 'Jueves perfecto 🎉', en: 'Thursday’s perfect 🎉' },
        ],
        question: {
          question: '¿Quién ha conseguido el día que le convenía?',
          questionEs: '¿Quién ha conseguido el día que le convenía?',
          options: [
            'Sonia, sin haber pedido nunca abiertamente otro día',
            'Carla, que propuso el viernes',
            'Dani, que propuso el sábado',
            'Nadie: al final no quedan',
          ],
          answer: 0,
          explanation:
            'Sonia sólo dijo que el viernes lo tenía complicado y que no le hicieran caso. El grupo hizo el resto — que es exactamente cómo funciona esa fórmula.',
        },
      },
    ],
  },

  // --- B2: an argument you have to weigh -----------------------------------
  {
    id: 'story.turismo',
    title: 'Dos cartas sobre el mismo barrio',
    blurb: 'La misma calle, dos vecinos, dos cartas al periódico. Los dos tienen parte de razón.',
    icon: 'newspaper-outline',
    level: 'B2',
    topics: ['city', 'opinions', 'home'],
    concepts: ['p.por-un-lado', 'p.a-pesar-de', 'v.vivienda', 'v.alquiler'],
    scenes: [
      {
        lines: [
          { es: 'Llevo cuarenta años en este barrio y ya no reconozco mi calle.', en: 'I’ve been in this neighbourhood forty years and I no longer recognise my street.' },
          { es: 'Han cerrado la mercería, la ferretería y los dos bares de siempre.', en: 'The haberdasher’s, the ironmonger’s and both of the old bars have closed.' },
          { es: 'No es que esté en contra del turismo; es que ya no queda nadie a quien saludar.', en: 'It’s not that I’m against tourism; it’s that there’s nobody left to say hello to.' },
        ],
        question: {
          question: '¿Cuál es exactamente la queja del primer vecino?',
          questionEs: '¿Cuál es exactamente la queja del primer vecino?',
          options: [
            'La pérdida del tejido social del barrio, no el turismo en sí',
            'Que los turistas hacen ruido por la noche',
            'Que los precios de los bares han subido',
            'Que no hay suficientes tiendas nuevas',
          ],
          answer: 0,
          explanation:
            'no es que… es que… separa lo que le atribuirían de lo que de verdad le duele: ya no queda nadie a quien saludar.',
        },
      },
      {
        lines: [
          { es: 'Con todo el respeto al vecino del martes: yo nací aquí y me tuve que ir.', en: 'With all due respect to Tuesday’s letter writer: I was born here and I had to leave.' },
          { es: 'No me echó el turismo, me echó un alquiler que subió un 40 % en tres años.', en: 'Tourism didn’t push me out, a rent that rose 40% in three years did.' },
          { es: 'A pesar de la nostalgia, el barrio de antes tampoco era para todos.', en: 'Despite the nostalgia, the old neighbourhood wasn’t for everyone either.' },
        ],
        question: {
          question: '¿En qué se diferencia el argumento del segundo vecino?',
          questionEs: '¿En qué se diferencia el argumento del segundo vecino?',
          options: [
            'Sitúa la causa en el precio de la vivienda y cuestiona la nostalgia del primero',
            'Niega que el barrio haya cambiado',
            'Defiende que el turismo ha mejorado el barrio',
            'Propone cerrar los pisos turísticos',
          ],
          answer: 0,
          explanation:
            'No contradice los hechos del primero: reordena las causas. a pesar de la nostalgia concede el sentimiento y a la vez lo desactiva como argumento.',
        },
      },
    ],
  },

  // --- C1: professional writing with something underneath ------------------
  {
    id: 'story.acta',
    title: 'Lo que dice el acta y lo que pasó',
    blurb: 'El acta de la reunión es impecable. Quien estuvo allí la lee de otra manera.',
    icon: 'briefcase-outline',
    level: 'C1',
    topics: ['work', 'opinions'],
    concepts: ['g.lo-nominal', 'g.se-impersonal', 'p.dejar-constancia', 'v.matiz'],
    scenes: [
      {
        lines: [
          { es: 'Se acordó revisar el calendario en la próxima sesión.', en: 'It was agreed to review the timetable at the next session.' },
          { es: 'Se tomó nota de las observaciones formuladas por el área técnica.', en: 'Note was taken of the observations made by the technical department.' },
          { es: 'No se registraron votos en contra.', en: 'No votes against were recorded.' },
        ],
        question: {
          question: '¿Qué hace el «se» impersonal en las tres líneas?',
          questionEs: '¿Qué hace el «se» impersonal en las tres líneas?',
          options: [
            'Borra a los responsables: hay acuerdos y notas, pero nadie que los haya tomado',
            'Indica que la reunión fue informal',
            'Señala que las decisiones fueron unánimes',
            'Marca que el acta está incompleta',
          ],
          answer: 0,
          explanation:
            'Se acordó, se tomó nota, no se registraron: tres pasivas reflejas sin sujeto. El lenguaje administrativo español está construido para no nombrar a nadie.',
        },
      },
      {
        lines: [
          { es: 'Lo que no dice el acta es que el área técnica habló durante cuarenta minutos.', en: 'What the minutes don’t say is that the technical department spoke for forty minutes.' },
          { es: 'Ni que «se tomó nota» significó, en la práctica, que nadie contestó.', en: 'Nor that “note was taken” meant, in practice, that nobody replied.' },
          { es: 'No se registraron votos en contra porque no se sometió nada a votación.', en: 'No votes against were recorded because nothing was put to a vote.' },
        ],
        question: {
          question: '¿Por qué es engañosa la frase «no se registraron votos en contra»?',
          questionEs: '¿Por qué es engañosa la frase «no se registraron votos en contra»?',
          options: [
            'Es literalmente cierta y sugiere un acuerdo que nunca llegó a existir',
            'Porque hubo votos en contra que se ocultaron',
            'Porque el acta se redactó después de la reunión',
            'Porque el área técnica no asistió',
          ],
          answer: 0,
          explanation:
            'La técnica es la implicatura: la frase no miente, pero deja que el lector complete «hubo consenso». Se puede desmontar sin acusar a nadie de falsedad.',
        },
      },
    ],
  },

  // --- C2: ambiguity as the subject ----------------------------------------
  {
    id: 'story.recomendacion',
    title: 'La carta de recomendación',
    blurb: 'Cuatro párrafos elogiosos. El comité la lee dos veces y entiende exactamente lo contrario.',
    icon: 'newspaper-outline',
    level: 'C2',
    topics: ['work', 'opinions'],
    concepts: ['g.audience', 'g.precision', 'p.no-tanto-como', 'v.escueto', 'v.tibio'],
    scenes: [
      {
        lines: [
          { es: 'Conozco a la candidata desde hace seis años y puedo afirmar que es puntual.', en: 'I have known the candidate for six years and can state that she is punctual.' },
          { es: 'Su trato con el equipo ha sido siempre correcto.', en: 'Her dealings with the team have always been correct.' },
          { es: 'No he tenido queja alguna de su trabajo.', en: 'I have had no complaints whatsoever about her work.' },
        ],
        question: {
          question: '¿Qué señal manda elogiar la puntualidad en primer lugar?',
          questionEs: '¿Qué señal manda elogiar la puntualidad en primer lugar?',
          options: [
            'Que no hay nada mayor que elogiar: se destaca lo mínimo exigible',
            'Que la candidata destaca por su organización',
            'Que el autor la conoce muy bien',
            'Que el puesto exige puntualidad estricta',
          ],
          answer: 0,
          explanation:
            'La fuerza de un elogio se mide por lo que descarta. Empezar por lo que se da por supuesto —puntual, correcto, sin quejas— es una forma reconocible de no decir nada bueno.',
        },
      },
      {
        lines: [
          { es: 'Cabe señalar que su perfil es no tanto innovador como sólido.', en: 'It is worth noting that her profile is not so much innovative as solid.' },
          { es: 'Para un puesto de estas características, sabrán ustedes valorarlo mejor que yo.', en: 'For a post of this kind, you will be better placed than I am to judge.' },
          { es: 'Quedo a su disposición para cualquier aclaración.', en: 'I remain at your disposal for any clarification.' },
        ],
        question: {
          question: '¿Qué hace «sabrán ustedes valorarlo mejor que yo»?',
          questionEs: '¿Qué hace «sabrán ustedes valorarlo mejor que yo»?',
          options: [
            'Retira el aval sin retirarlo: el autor se aparta de la recomendación por cortesía',
            'Reconoce que el comité tiene más experiencia técnica',
            'Ofrece ayuda adicional al comité',
            'Confirma que la candidata encaja en el puesto',
          ],
          answer: 0,
          explanation:
            'Es una descarga de responsabilidad. Combinada con no tanto innovador como sólido, la carta cumple con la cortesía y deja al comité la conclusión que el autor no quiere firmar.',
        },
      },
    ],
  },
{
    id: 'story.anuncios',
    title: 'Dos anuncios, un presupuesto',
    blurb: 'Dos pisos, el mismo precio y una diferencia que no aparece en las fotos.',
    icon: 'home-outline',
    level: 'A2',
    topics: ['home', 'opinions', 'city'],
    concepts: ['g.comparisons', 'v.caro', 'v.barato', 'v.piso'],
    scenes: [
      {
        lines: [
          { es: 'PISO A — Centro. 55 m². 900 €/mes. Cuarto sin ascensor.', en: 'FLAT A — City centre. 55 m². €900/month. Fourth floor, no lift.' },
          { es: 'Muy luminoso. Metro a dos minutos. Ruidoso los fines de semana.', en: 'Very bright. Metro two minutes away. Noisy at weekends.' },
          { es: 'PISO B — Afueras. 75 m². 900 €/mes. Con ascensor y terraza.', en: 'FLAT B — Outskirts. 75 m². €900/month. With a lift and a terrace.' },
          { es: 'Tranquilo. Metro a veinte minutos andando.', en: 'Quiet. Metro twenty minutes on foot.' },
        ],
        question: {
          question: 'Which statement is true?',
          options: [
            'Flat B is bigger than flat A but further from the metro',
            'Flat B is cheaper than flat A',
            'Flat A is bigger and quieter',
            'Both flats have a lift',
          ],
          answer: 0,
          explanation:
            'Same price, 75 m² against 55 m², but twenty minutes’ walk against two. The trade-off is space and quiet against location.',
        },
      },
      {
        lines: [
          { es: '—Yo me quedaría con el B, es más grande y más barato por metro.', en: '“I’d go for B, it’s bigger and cheaper per square metre.”' },
          { es: '—Ya, pero si trabajas en el centro, pierdes cuarenta minutos al día.', en: '“Right, but if you work in the centre, you lose forty minutes a day.”' },
          { es: '—Depende de lo que valga tu tiempo, entonces.', en: '“It depends what your time is worth, then.”' },
        ],
        question: {
          question: 'What does the last speaker conclude?',
          options: [
            'Neither flat is objectively better — it depends on what you value',
            'Flat B is clearly the better choice',
            'Flat A is clearly the better choice',
            'Both flats are too expensive',
          ],
          answer: 0,
          explanation:
            'depende de lo que valga tu tiempo turns the comparison into a personal judgement rather than a fact about the flats.',
        },
      },
    ],
  },

  {
    id: 'story.movilidad',
    title: 'El carril y la calle',
    blurb:
      'Un carril bici, dos cartas al periódico y un informe municipal. Los tres dicen la verdad y ninguno dice lo mismo.',
    icon: 'newspaper-outline',
    level: 'B2',
    topics: ['city', 'opinions', 'transport'],
    concepts: ['p.por-un-lado', 'p.a-pesar-de', 'v.dato', 'v.medida', 'v.polemica'],
    scenes: [
      {
        lines: [
          {
            es: 'El Ayuntamiento quitó una fila de aparcamiento en la calle Mayor para poner un carril bici.',
            en: 'The council removed a row of parking on Calle Mayor to put in a cycle lane.',
          },
          {
            es: 'La medida se aprobó en junio, sin apenas debate, y entró en vigor en septiembre.',
            en: 'The measure was approved in June with barely any debate, and came into force in September.',
          },
          {
            es: 'Tres meses después, la polémica sigue viva en las páginas de cartas del periódico local.',
            en: 'Three months on, the controversy is still alive in the local paper’s letters pages.',
          },
        ],
        question: {
          question: '¿Qué detalle sugiere que la protesta era previsible?',
          questionEs: '¿Qué detalle sugiere que la protesta era previsible?',
          options: [
            'Que se aprobó «sin apenas debate», de modo que nadie afectado fue escuchado antes',
            'Que el carril bici es demasiado estrecho',
            'Que la medida entró en vigor en septiembre',
            'Que el periódico es local',
          ],
          answer: 0,
          explanation:
            'La frase no dice que la medida fuese mala: dice que se decidió sin discusión. Es una crítica al procedimiento, colocada como si fuese un dato neutro.',
        },
      },
      {
        lines: [
          {
            es: 'CARTA 1. «Llevo veintidós años con la ferretería en esta calle.',
            en: 'LETTER 1. “I’ve had the hardware shop on this street for twenty-two years.',
          },
          {
            es: 'Mis clientes venían en coche porque compran cosas que pesan. Ahora no pueden parar.',
            en: 'My customers came by car because they buy heavy things. Now they can’t stop.',
          },
          {
            es: 'No estoy en contra de la bici. Estoy en contra de que decidan por mí y me lo llamen progreso.»',
            en: 'I’m not against bikes. I’m against them deciding for me and calling it progress.”',
          },
        ],
        question: {
          question: '¿Dónde sitúa el ferretero su objeción?',
          questionEs: '¿Dónde sitúa el ferretero su objeción?',
          options: [
            'En quién decide, no en el carril bici en sí',
            'En que las bicicletas son peligrosas',
            'En que el alquiler de su local ha subido',
            'En que la calle está más sucia',
          ],
          answer: 0,
          explanation:
            'La estructura «no estoy en contra de X, estoy en contra de que…» separa lo que le atribuirían de lo que de verdad le molesta. El objeto de la queja es el procedimiento.',
        },
      },
      {
        lines: [
          {
            es: 'CARTA 2. «Cruzo esa calle todos los días con dos niños.',
            en: 'LETTER 2. “I cross that street every day with two children.',
          },
          {
            es: 'Antes había coches aparcados en doble fila y no veíamos nada al cruzar.',
            en: 'Before, there were cars double-parked and we couldn’t see a thing when crossing.',
          },
          {
            es: 'A los comerciantes les entiendo, de verdad. Pero mi hijo también tiene derecho a llegar al colegio.»',
            en: 'I do understand the shopkeepers, honestly. But my son also has a right to get to school.”',
          },
        ],
        question: {
          question: '¿Qué hace la segunda carta antes de discrepar?',
          questionEs: '¿Qué hace la segunda carta antes de discrepar?',
          options: [
            'Concede que la otra parte tiene motivos, y solo después pone su propio derecho enfrente',
            'Acusa a los comerciantes de egoísmo',
            'Niega que hubiera coches en doble fila',
            'Pide que se retire el carril bici',
          ],
          answer: 0,
          explanation:
            '«A los comerciantes les entiendo, de verdad. Pero…» — conceder primero y objetar después es la forma estándar del desacuerdo en español, y aquí hace la carta mucho más difícil de rebatir.',
        },
      },
      {
        lines: [
          {
            es: 'INFORME MUNICIPAL. Los atropellos en la calle Mayor han bajado un 60 % en un año.',
            en: 'COUNCIL REPORT. Pedestrian collisions on Calle Mayor are down 60% in a year.',
          },
          {
            es: 'La facturación media del comercio de la zona ha bajado un 4 %.',
            en: 'Average retail turnover in the area is down 4%.',
          },
          {
            es: 'El informe no compara con el resto de la ciudad, donde la facturación bajó un 5 %.',
            en: 'The report does not compare with the rest of the city, where turnover fell 5%.',
          },
        ],
        question: {
          question: '¿Por qué importa el último dato?',
          questionEs: '¿Por qué importa el último dato?',
          options: [
            'Porque el comercio de la zona cayó menos que la media: el carril no explica la caída',
            'Porque demuestra que el carril bici arruinó a los comerciantes',
            'Porque los atropellos no bajaron de verdad',
            'Porque el informe está mal hecho',
          ],
          answer: 0,
          explanation:
            'Un 4 % frente a un 5 % de la ciudad significa que la zona aguantó mejor que la media. El dato que faltaba no refuta al ferretero por completo, pero desmonta la causa que él le atribuye.',
        },
      },
    ],
  },
  {
    id: 'story.acta-larga',
    title: 'Lo que consta y lo que ocurrió',
    blurb:
      'Un correo, un acta y una nota manuscrita sobre la misma reunión. Nadie falta a la verdad; la versión oficial es la menos exacta.',
    icon: 'briefcase-outline',
    level: 'C1',
    topics: ['work', 'opinions'],
    concepts: ['g.se-impersonal', 'g.lo-nominal', 'p.dejar-constancia', 'v.matiz', 'v.sesgo'],
    scenes: [
      {
        lines: [
          {
            es: 'CORREO, martes 9:14. «Os recuerdo que mañana hay que cerrar el proveedor.',
            en: 'EMAIL, Tuesday 9:14. “A reminder that we have to settle the supplier tomorrow.',
          },
          {
            es: 'Si alguien tiene una objeción de fondo, que la diga hoy, por favor.',
            en: 'If anyone has a substantive objection, please say so today.',
          },
          { es: 'Mañana ya no hay margen.»', en: 'Tomorrow there’s no room left.”' },
        ],
        question: {
          question: '¿Qué condición pone el correo sin decirlo abiertamente?',
          questionEs: '¿Qué condición pone el correo sin decirlo abiertamente?',
          options: [
            'Que quien no objete hoy pierde el derecho a objetar después',
            'Que la decisión ya está tomada y no admite cambios',
            'Que el proveedor es el más barato',
            'Que la reunión se aplaza',
          ],
          answer: 0,
          explanation:
            '«Mañana ya no hay margen» convierte el silencio de hoy en consentimiento. Es una cláusula, escrita como si fuese un aviso logístico.',
        },
      },
      {
        lines: [
          {
            es: 'ACTA. «Se presentó la propuesta de adjudicación.',
            en: 'MINUTES. “The award proposal was presented.',
          },
          {
            es: 'Se recogieron las observaciones del área técnica y se acordó continuar.',
            en: 'The technical department’s observations were noted and it was agreed to proceed.',
          },
          { es: 'No se formularon objeciones.»', en: 'No objections were raised.”' },
        ],
        question: {
          question: '¿Qué consigue el acta con «no se formularon objeciones»?',
          questionEs: '¿Qué consigue el acta con «no se formularon objeciones»?',
          options: [
            'Deja que el lector concluya que hubo consenso, sin afirmarlo en ningún momento',
            'Afirma que todos votaron a favor',
            'Reconoce que el área técnica se opuso',
            'Indica que la reunión fue muy corta',
          ],
          answer: 0,
          explanation:
            'Es implicatura, no mentira. Registrar la ausencia de objeciones formales invita a leer «acuerdo» donde solo hubo silencio — y las tres pasivas reflejas se aseguran de que nadie firme esa lectura.',
        },
      },
      {
        lines: [
          {
            es: 'NOTA MANUSCRITA, en el margen del acta.',
            en: 'HANDWRITTEN NOTE, in the margin of the minutes.',
          },
          {
            es: '«El área técnica habló 40 min. Dijo que el plazo era inviable con ese proveedor.',
            en: '“Technical spoke for 40 min. Said the deadline was unworkable with that supplier.',
          },
          {
            es: 'Nadie contestó. Eso es lo que aquí se llama "recoger observaciones".»',
            en: 'Nobody replied. That is what gets called “noting observations” around here.”',
          },
        ],
        question: {
          question: '¿Qué añade la nota al acta?',
          questionEs: '¿Qué añade la nota al acta?',
          options: [
            'No contradice ningún hecho del acta: aporta lo que el acta decidió no registrar',
            'Demuestra que el acta contiene datos falsos',
            'Prueba que el área técnica votó en contra',
            'Indica que la reunión no se celebró',
          ],
          answer: 0,
          explanation:
            'Todo lo que dice el acta sigue siendo cierto. Lo que la nota expone es la distancia entre «se recogieron observaciones» y lo que ocurrió, que es exactamente donde vive el sesgo.',
        },
      },
      {
        lines: [
          {
            es: 'Tres semanas después, el proveedor comunicó que no llegaba a la fecha.',
            en: 'Three weeks later, the supplier announced they would not make the date.',
          },
          {
            es: 'En la reunión siguiente se pidió «reconstruir el proceso de decisión».',
            en: 'At the next meeting there was a request to “reconstruct the decision process”.',
          },
          {
            es: 'El acta de junio decía: «no se formularon objeciones». La nota del margen no constaba en ningún sitio.',
            en: 'The June minutes said: “no objections were raised”. The margin note was on no record anywhere.',
          },
        ],
        question: {
          question: '¿Cuál es la lección práctica del último párrafo?',
          questionEs: '¿Cuál es la lección práctica del último párrafo?',
          options: [
            'Una objeción que no se deja por escrito no existe cuando se revisa lo ocurrido',
            'Que el proveedor era el culpable de todo',
            'Que las actas no sirven para nada',
            'Que el área técnica debería haber votado en contra',
          ],
          answer: 0,
          explanation:
            'De ahí la fórmula «quisiera dejar constancia de…». No es formalismo vacío: es lo único que sobrevive a la reconstrucción de los hechos.',
        },
      },
    ],
  },

  // ===========================================================================
  // Long-form readings
  //
  // The pieces above are 50–200 words: enough to sample a structure, not enough
  // to *read*. From B1 up a learner needs texts that take several minutes, where
  // an argument develops across paragraphs and where what is meant is not always
  // what is written. These five are that: a saga, a memo and its replies, a
  // report against its own annexes, and a column that means the opposite of what
  // it says. The questions test inference at least as often as comprehension.
  // ===========================================================================
  {
    id: 'story.mudanza',
    title: 'La mudanza',
    blurb: 'Cinco escenas, un piso, y una fianza que nadie quiere devolver.',
    icon: 'home-outline',
    level: 'B1',
    topics: ['home', 'past', 'storytelling'],
    concepts: ['g.preterite-imperfect', 'g.object-pronouns', 'v.quedar', 'v.llevar', 'p.hay-un-problema'],
    scenes: [
      {
        lines: [
          {
            es: 'Vimos el piso un martes por la tarde. Llovía, y por dentro estaba más oscuro de lo que parecía en las fotos.',
            en: 'We saw the flat on a Tuesday afternoon. It was raining, and inside it was darker than it looked in the photos.',
          },
          {
            es: 'La casera nos enseñó la cocina, el salón y una habitación que ella llamaba «despacho» y que era, en realidad, un armario con ventana.',
            en: 'The landlady showed us the kitchen, the living room and a room she called “the study”, which was in fact a cupboard with a window.',
          },
          {
            es: 'Nos gustó igual. Estaba cerca del metro, la calefacción funcionaba y llevábamos dos meses buscando.',
            en: 'We liked it anyway. It was near the metro, the heating worked and we had been looking for two months.',
          },
          {
            es: 'Firmamos el viernes. Le dimos dos meses de fianza en efectivo y ella nos dio un recibo escrito a mano.',
            en: 'We signed on the Friday. We gave her two months’ deposit in cash and she gave us a handwritten receipt.',
          },
        ],
        question: {
          question: 'Why did they take the flat despite the drawbacks?',
          questionEs: '¿Por qué se quedaron con el piso a pesar de los inconvenientes?',
          options: [
            'Llevaban dos meses buscando y estaban cansados de buscar',
            'Porque era el piso más barato que habían visto',
            'Porque la casera les cayó muy bien',
            'Porque el despacho les pareció muy útil',
          ],
          answer: 0,
          explanation:
            '«Llevábamos dos meses buscando» es la razón real, y el texto la deja caer al final de la lista sin subrayarla. El «igual» de «nos gustó igual» hace el resto del trabajo.',
        },
      },
      {
        lines: [
          {
            es: 'El día de la mudanza empezó mal. La furgoneta que habíamos alquilado no cabía por la calle, así que la dejamos a doscientos metros.',
            en: 'Moving day started badly. The van we had hired didn’t fit down the street, so we left it two hundred metres away.',
          },
          {
            es: 'Subimos veinte cajas a pulso por unas escaleras estrechas, con un vecino mirando desde el rellano y sin ofrecerse ni una vez.',
            en: 'We carried twenty boxes up a narrow staircase by hand, with a neighbour watching from the landing and not offering once.',
          },
          {
            es: 'A las siete apareció el de abajo. Dijo que llevaba toda la tarde oyendo golpes y que su hija estaba estudiando.',
            en: 'At seven the man from downstairs appeared. He said he had been hearing banging all afternoon and that his daughter was studying.',
          },
          {
            es: 'Le pedimos perdón, le explicamos que nos quedaban tres cajas y le dijimos que en media hora habríamos terminado. Se fue sin contestar.',
            en: 'We apologised, explained that we had three boxes left and told him we would be finished in half an hour. He left without replying.',
          },
        ],
        question: {
          question: 'What does “se fue sin contestar” tell you about the neighbour?',
          questionEs: '¿Qué indica «se fue sin contestar» sobre el vecino?',
          options: [
            'Que no aceptó la disculpa, aunque tampoco discutió',
            'Que se quedó satisfecho con la explicación',
            'Que no entendió lo que le decían',
            'Que tenía prisa por volver con su hija',
          ],
          answer: 0,
          explanation:
            'Irse sin contestar no es aceptar: es retirarse sin conceder nada. El texto no lo dice, lo escenifica, y esa diferencia es la que se pide leer.',
        },
      },
      {
        lines: [
          {
            es: 'Vivimos allí dos años. El primer invierno descubrimos que la calefacción funcionaba, sí, pero que costaba casi tanto como el alquiler.',
            en: 'We lived there for two years. The first winter we discovered that the heating did work, but that it cost almost as much as the rent.',
          },
          {
            es: 'La casera pasaba cada seis meses, miraba las paredes, decía «esto está muy bien cuidado» y se marchaba.',
            en: 'The landlady came by every six months, looked at the walls, said “this is very well looked after” and left.',
          },
          {
            es: 'Nos llevábamos bien con casi todos: con la del cuarto, que nos guardaba los paquetes; con el del segundo, que no.',
            en: 'We got on well with almost everyone: with the woman on the fourth floor, who took in our parcels; with the man on the second, not so much.',
          },
          {
            es: 'Cuando decidimos irnos, avisamos con dos meses, como decía el contrato, y limpiamos el piso entero un domingo.',
            en: 'When we decided to leave, we gave two months’ notice, as the contract said, and cleaned the whole flat one Sunday.',
          },
        ],
        question: {
          question: 'Why does the narrator mention the landlady’s six-monthly visits?',
          questionEs: '¿Por qué menciona el narrador las visitas semestrales de la casera?',
          options: [
            'Para dejar constancia de que ella misma reconoció el buen estado del piso',
            'Para explicar que la casera era una persona atenta',
            'Para justificar por qué subió el alquiler',
            'Para contar cómo se conocieron mejor con el tiempo',
          ],
          answer: 0,
          explanation:
            'El detalle parece decorativo hasta la escena siguiente. «Esto está muy bien cuidado», dicho por la casera cuatro veces, es la prueba que el narrador está guardando.',
        },
      },
      {
        lines: [
          {
            es: 'La fianza no llegó. Al mes escribimos un correo educado preguntando por ella; no contestó.',
            en: 'The deposit didn’t arrive. After a month we wrote a polite email asking about it; she didn’t reply.',
          },
          {
            es: 'A las tres semanas la llamamos. Dijo que había un problema con unas humedades del baño y que el técnico aún no le había pasado el presupuesto.',
            en: 'Three weeks later we phoned her. She said there was a problem with damp in the bathroom and that the technician hadn’t sent her the quote yet.',
          },
          {
            es: 'Le recordamos que en la última visita nos había dicho que el piso estaba muy bien cuidado, y que lo había dicho delante de los dos.',
            en: 'We reminded her that on her last visit she had told us the flat was very well looked after, and that she had said it in front of both of us.',
          },
          {
            es: 'Hubo un silencio largo. Luego dijo que lo miraría y que ya nos diría algo.',
            en: 'There was a long silence. Then she said she would look into it and would let us know.',
          },
        ],
        question: {
          question: 'What is the function of the “silencio largo”?',
          questionEs: '¿Qué función tiene «hubo un silencio largo» en el relato?',
          options: [
            'Marca el momento en que la casera se queda sin argumento, sin que el texto lo diga',
            'Indica que la llamada se cortó',
            'Sugiere que la casera estaba consultando un documento',
            'Muestra que los inquilinos habían sido groseros',
          ],
          answer: 0,
          explanation:
            'El relato nunca acusa a nadie de mentir. Coloca la frase de la casera en la escena tres, la repite en la cuatro, y deja que el silencio haga la acusación.',
        },
      },
      {
        lines: [
          {
            es: 'La fianza llegó cuarenta días después, completa, sin una palabra sobre las humedades.',
            en: 'The deposit arrived forty days later, in full, without a word about the damp.',
          },
          {
            es: 'No hubo disculpa ni explicación. Llegó una transferencia con el concepto «devolución» y ya está.',
            en: 'There was no apology and no explanation. A transfer arrived marked “refund” and that was that.',
          },
          {
            es: 'Con el tiempo he pensado que ni siquiera intentaba estafarnos: probaba a ver si nos rendíamos, como se prueba una puerta para ver si está cerrada.',
            en: 'Over time I’ve come to think she wasn’t even trying to cheat us: she was testing whether we’d give up, the way you try a door to see if it’s locked.',
          },
          {
            es: 'Lo aprendimos tarde, pero lo aprendimos: en este país las cosas se piden por escrito y se recuerdan en voz alta.',
            en: 'We learned it late, but we learned it: in this country you ask for things in writing and you remind people out loud.',
          },
        ],
        question: {
          question: 'What is the narrator’s final judgement of the landlady?',
          questionEs: '¿Cuál es el juicio final del narrador sobre la casera?',
          options: [
            'Que no era deshonesta por sistema, sino que tanteaba hasta encontrar resistencia',
            'Que era una estafadora profesional',
            'Que había cometido un error administrativo sin mala fe',
            'Que se comportó correctamente en todo momento',
          ],
          answer: 0,
          explanation:
            'La comparación con la puerta es el juicio: no un plan, sino una costumbre de probar. Es más duro que llamarla estafadora, y el narrador no usa la palabra ni una vez.',
        },
      },
    ],
  },
  {
    id: 'story.teletrabajo',
    title: 'Tres correos y lo que pasó de verdad',
    blurb: 'Una circular, una respuesta y un acta. El mismo hecho, tres registros y tres versiones.',
    icon: 'briefcase-outline',
    level: 'B2',
    topics: ['work', 'opinions'],
    concepts: ['g.register', 'p.hay-que-tener-en-cuenta', 'p.al-parecer', 'p.llevar-a-cabo', 'v.medida'],
    scenes: [
      {
        lines: [
          {
            es: 'CIRCULAR INTERNA. Asunto: nuevo marco de presencialidad.',
            en: 'INTERNAL MEMO. Subject: new attendance framework.',
          },
          {
            es: 'Tras evaluar la experiencia de los últimos dos años, la dirección ha decidido implantar un modelo de tres días de presencia semanal a partir del 1 de octubre.',
            en: 'Having evaluated the last two years, management has decided to introduce a three-day-a-week in-office model from 1 October.',
          },
          {
            es: 'La medida responde a la necesidad de reforzar la cohesión de los equipos y facilitar la incorporación de los nuevos compañeros.',
            en: 'The measure responds to the need to strengthen team cohesion and ease the integration of new colleagues.',
          },
          {
            es: 'Se agradece de antemano la colaboración de toda la plantilla en la puesta en marcha de este nuevo marco.',
            en: 'The cooperation of all staff in implementing this new framework is appreciated in advance.',
          },
        ],
        question: {
          question: 'What does “se agradece de antemano la colaboración” actually do here?',
          questionEs: '¿Qué hace en realidad la fórmula «se agradece de antemano la colaboración»?',
          options: [
            'Presenta como colaboración voluntaria algo que ya está decidido',
            'Pide sinceramente la opinión de la plantilla antes de decidir',
            'Reconoce que la medida puede no llegar a aplicarse',
            'Agradece un trabajo que la plantilla ya ha hecho',
          ],
          answer: 0,
          explanation:
            'Agradecer por adelantado convierte una orden en un favor concedido. El «se» impersonal remata la operación: nadie da la orden y nadie la recibe.',
        },
      },
      {
        lines: [
          {
            es: 'RESPUESTA DEL EQUIPO DE PRODUCTO. Hola a todas: queremos hacer una observación antes de que esto se dé por cerrado.',
            en: 'REPLY FROM THE PRODUCT TEAM. Hi everyone: we want to make an observation before this is treated as settled.',
          },
          {
            es: 'Nadie discute lo de la cohesión. Ahora bien, hay que tener en cuenta que cuatro de las seis personas que se han incorporado este año viven fuera de Madrid.',
            en: 'Nobody disputes the cohesion argument. That said, it must be borne in mind that four of the six people who joined this year live outside Madrid.',
          },
          {
            es: 'Si el objetivo es integrarlas, obligarlas a tres días de tren no parece el camino más corto.',
            en: 'If the aim is to integrate them, forcing them onto three days of trains doesn’t look like the shortest route.',
          },
          {
            es: 'Proponemos dos días fijos de equipo y un tercero flexible por proyecto. Estamos a favor de vernos; lo que no vemos es el número.',
            en: 'We propose two fixed team days and a flexible third by project. We’re in favour of seeing each other; what we don’t see is the number.',
          },
        ],
        question: {
          question: 'What rhetorical move does the product team make?',
          questionEs: '¿Cuál es la maniobra retórica del equipo de producto?',
          options: [
            'Aceptan el objetivo de la dirección y atacan solo el medio elegido',
            'Rechazan el objetivo y proponen otro completamente distinto',
            'Se limitan a quejarse sin proponer alternativa',
            'Piden que se retrase la decisión sin dar razones',
          ],
          answer: 0,
          explanation:
            'Conceden el fin («nadie discute lo de la cohesión») para poder discutir el medio. «Estamos a favor de vernos; lo que no vemos es el número» resume la estrategia en una línea.',
        },
      },
      {
        lines: [
          {
            es: 'ACTA DE LA REUNIÓN DE SEGUIMIENTO, 12 DE SEPTIEMBRE.',
            en: 'MINUTES OF THE FOLLOW-UP MEETING, 12 SEPTEMBER.',
          },
          {
            es: 'Se expusieron las distintas sensibilidades existentes en torno al nuevo marco de presencialidad.',
            en: 'The various sensitivities around the new attendance framework were set out.',
          },
          {
            es: 'Se acordó mantener el calendario previsto, sin perjuicio de los ajustes que puedan valorarse más adelante.',
            en: 'It was agreed to keep to the planned timetable, without prejudice to adjustments that may be considered later on.',
          },
          {
            es: 'No se registraron objeciones formales a la propuesta de la dirección.',
            en: 'No formal objections to management’s proposal were recorded.',
          },
        ],
        question: {
          question: 'Why is “no se registraron objeciones formales” technically true but misleading?',
          questionEs: '¿Por qué «no se registraron objeciones formales» es cierto y engañoso a la vez?',
          options: [
            'La objeción existió por escrito, pero el acta la reclasifica como «sensibilidad»',
            'Porque el equipo de producto no asistió a la reunión',
            'Porque las objeciones se presentaron fuera de plazo',
            'Porque la dirección retiró la propuesta antes de la votación',
          ],
          answer: 0,
          explanation:
            'La palabra que hace el trabajo es «formales». La respuesta del equipo existe, está escrita y es una objeción; el acta la degrada a «sensibilidad» y así puede decir la verdad literal.',
        },
      },
      {
        lines: [
          {
            es: 'El 1 de octubre entró en vigor el modelo de tres días. En noviembre, la asistencia media real era de 2,1 días.',
            en: 'On 1 October the three-day model came into force. In November, real average attendance was 2.1 days.',
          },
          {
            es: 'No hubo sanciones, ni recordatorios, ni una segunda circular. Los responsables de equipo miraron para otro lado, cada uno por su cuenta.',
            en: 'There were no sanctions, no reminders, and no second memo. Team leads looked the other way, each on their own.',
          },
          {
            es: 'En enero se publicó un nuevo marco: dos días fijos y un tercero flexible por proyecto.',
            en: 'In January a new framework was published: two fixed days and a flexible third by project.',
          },
          {
            es: 'La circular decía que el modelo se había ajustado «a la vista de la experiencia acumulada». No mencionaba ningún correo.',
            en: 'The memo said the model had been adjusted “in the light of accumulated experience”. It mentioned no emails.',
          },
        ],
        question: {
          question: 'What actually decided the outcome?',
          questionEs: '¿Qué decidió realmente el resultado?',
          options: [
            'El incumplimiento silencioso y generalizado, no el debate escrito',
            'La respuesta razonada del equipo de producto',
            'Una votación formal de la plantilla',
            'Una intervención del comité de empresa',
          ],
          answer: 0,
          explanation:
            'La propuesta que acaba aprobándose es exactamente la del equipo de producto, y aun así la circular final atribuye el cambio a «la experiencia acumulada». Ganó el argumento y perdió la autoría.',
        },
      },
      {
        lines: [
          {
            es: 'Merece la pena releer las tres piezas juntas. La circular no da razones: da un motivo y una fecha.',
            en: 'It’s worth rereading the three pieces together. The memo gives no reasons: it gives a rationale and a date.',
          },
          {
            es: 'La respuesta del equipo sí argumenta, y por eso es la única de las tres que se puede rebatir.',
            en: 'The team’s reply does argue, and that is why it is the only one of the three that can be rebutted.',
          },
          {
            es: 'El acta no argumenta ni informa: administra. Su función no es contar lo que pasó, sino fijar qué contará como que pasó.',
            en: 'The minutes neither argue nor inform: they administer. Their function is not to record what happened but to fix what will count as having happened.',
          },
          {
            es: 'De ahí que convenga leer las actas dos veces: una por lo que dicen y otra por lo que dejan de decir.',
            en: 'Hence the wisdom of reading minutes twice: once for what they say and once for what they leave out.',
          },
        ],
        question: {
          question: 'What distinction does the final scene draw between the three texts?',
          questionEs: '¿Qué distinción establece la última escena entre los tres textos?',
          options: [
            'Solo el segundo argumenta; el primero ordena y el tercero administra el relato',
            'Los tres argumentan, pero con distinto nivel de formalidad',
            'El primero informa, el segundo se queja y el tercero resume',
            'Ninguno de los tres contiene opiniones',
          ],
          answer: 0,
          explanation:
            'Es el resumen del texto entero: dar un motivo no es dar una razón, y un acta no registra los hechos sino la versión de los hechos que quedará.',
        },
      },
    ],
  },
  {
    id: 'story.informe',
    title: 'El informe y sus anexos',
    blurb: 'El resumen ejecutivo dice una cosa. El anexo IV, que nadie abre, dice otra.',
    icon: 'newspaper-outline',
    level: 'C1',
    topics: ['work', 'opinions'],
    concepts: ['g.lo-nominal', 'v.sesgo', 'v.constatar', 'p.si-bien', 'p.de-ahi-que', 'p.ahora-bien'],
    scenes: [
      {
        lines: [
          {
            es: 'RESUMEN EJECUTIVO. La satisfacción del usuario con el nuevo servicio alcanza el 82 %, lo que confirma el acierto del rediseño.',
            en: 'EXECUTIVE SUMMARY. User satisfaction with the new service reaches 82%, confirming that the redesign was the right call.',
          },
          {
            es: 'Se constata asimismo una reducción del 30 % en el tiempo medio de resolución de incidencias.',
            en: 'A 30% reduction in average incident resolution time is likewise confirmed.',
          },
          {
            es: 'Si bien persisten áreas de mejora, los indicadores respaldan la continuidad de la línea emprendida.',
            en: 'While areas for improvement persist, the indicators support continuing along the line taken.',
          },
          {
            es: 'Se recomienda extender el modelo al resto de la organización en el primer trimestre.',
            en: 'It is recommended that the model be extended to the rest of the organisation in the first quarter.',
          },
        ],
        question: {
          question: 'What is “lo que confirma el acierto del rediseño” doing grammatically and rhetorically?',
          questionEs: '¿Qué hace «lo que confirma el acierto del rediseño», gramatical y retóricamente?',
          options: [
            'Convierte un dato en una conclusión mediante un relativo, sin argumentar el paso',
            'Introduce una hipótesis que el resto del informe pondrá a prueba',
            'Cita textualmente la conclusión de un evaluador externo',
            'Matiza el dato anterior reconociendo su margen de error',
          ],
          answer: 0,
          explanation:
            'El «lo que» encadena dato y juicio como si el segundo se siguiera del primero. Un 82 % es un dato; que confirme un acierto es una interpretación que aquí viaja de polizón.',
        },
      },
      {
        lines: [
          {
            es: 'ANEXO IV. Metodología. La encuesta se remitió a 4.100 usuarios y obtuvo 611 respuestas válidas.',
            en: 'ANNEX IV. Methodology. The survey was sent to 4,100 users and obtained 611 valid responses.',
          },
          {
            es: 'El cuestionario se envió únicamente a quienes habían completado al menos tres operaciones en el nuevo entorno.',
            en: 'The questionnaire was sent only to those who had completed at least three operations in the new environment.',
          },
          {
            es: 'No se recabó información de los usuarios que abandonaron el proceso antes de finalizarlo.',
            en: 'No information was gathered from users who abandoned the process before completing it.',
          },
          {
            es: 'La tasa de abandono en el periodo analizado fue del 21 %.',
            en: 'The abandonment rate in the period analysed was 21%.',
          },
        ],
        question: {
          question: 'What does Annex IV do to the 82% figure?',
          questionEs: '¿Qué le hace el anexo IV a la cifra del 82 %?',
          options: [
            'La deja intacta y la vacía: mide solo a quienes el sistema no expulsó',
            'La contradice directamente con otra medición',
            'La corrige al alza por un error de cálculo',
            'La confirma con una segunda fuente independiente',
          ],
          answer: 0,
          explanation:
            'El 82 % es cierto. Está calculado sobre una muestra de la que se ha excluido, por construcción, a todo el que tuvo problemas. Sesgo de supervivencia, redactado sin mentir una sola vez.',
        },
      },
      {
        lines: [
          {
            es: 'ANEXO VII. Tiempos de resolución. La reducción del 30 % se calcula sobre las incidencias cerradas en el sistema.',
            en: 'ANNEX VII. Resolution times. The 30% reduction is calculated on incidents closed in the system.',
          },
          {
            es: 'A partir de marzo se modificó el criterio de cierre automático: las incidencias sin respuesta del usuario en 72 horas pasan a cerrarse de oficio.',
            en: 'From March the automatic closure criterion was changed: incidents with no user response within 72 hours are now closed automatically.',
          },
          {
            es: 'El número de incidencias cerradas de oficio pasó de 240 en febrero a 1.930 en abril.',
            en: 'The number of incidents closed automatically went from 240 in February to 1,930 in April.',
          },
          {
            es: 'No se dispone de datos sobre reapertura posterior por el mismo motivo.',
            en: 'No data is available on subsequent reopening for the same reason.',
          },
        ],
        question: {
          question: 'Why did resolution time fall?',
          questionEs: '¿Por qué bajó el tiempo de resolución?',
          options: [
            'Porque cambió la definición de «resuelto», no necesariamente el servicio',
            'Porque se contrató a más personal de soporte',
            'Porque los usuarios aprendieron a usar el sistema',
            'Porque se redujo el número total de incidencias',
          ],
          answer: 0,
          explanation:
            'Un indicador que mejora justo después de que cambie su definición no ha mejorado: se ha redefinido. Y la ausencia de datos de reapertura impide comprobarlo, lo cual también es un dato.',
        },
      },
      {
        lines: [
          {
            es: 'CORREO INTERNO, 14 DE MAYO. «Oye, ¿has visto que el anexo IV cuenta lo de la muestra?»',
            en: 'INTERNAL EMAIL, 14 MAY. “Hey, have you seen that Annex IV explains the sampling?”',
          },
          {
            es: '«Sí. Está todo dicho, no hemos ocultado nada. Ahora bien, el resumen es lo único que se lee.»',
            en: '“Yes. It’s all stated, we haven’t hidden anything. That said, the summary is the only thing anyone reads.”',
          },
          {
            es: '«Ya, pero si alguien lo mira en la comisión quedamos fatal.»',
            en: '“Sure, but if someone looks at it in committee we come off terribly.”',
          },
          {
            es: '«Nadie lo mira. Y si lo mira, le enseñamos el anexo y le decimos que está publicado desde el principio.»',
            en: '“Nobody looks at it. And if they do, we show them the annex and tell them it’s been published from the start.”',
          },
        ],
        question: {
          question: 'What is the strategy revealed by the email exchange?',
          questionEs: '¿Cuál es la estrategia que revela el intercambio de correos?',
          options: [
            'Publicar la información limitante donde nadie la lee, para poder alegar transparencia',
            'Retirar el anexo IV antes de que llegue a la comisión',
            'Corregir el resumen ejecutivo antes de la publicación',
            'Encargar una segunda encuesta más representativa',
          ],
          answer: 0,
          explanation:
            'La defensa está preparada de antemano: «está publicado desde el principio». Transparencia como coartada, no como práctica — y todo ello sin una sola afirmación falsa.',
        },
      },
      {
        lines: [
          {
            es: 'De ahí que leer un informe sea, en la práctica, leer la distancia entre su resumen y sus anexos.',
            en: 'Hence reading a report is, in practice, reading the distance between its summary and its annexes.',
          },
          {
            es: 'Lo llamativo no es que el resumen exagere: es que no necesita exagerar. Le basta con no repetir lo que el anexo ya ha dicho.',
            en: 'What is striking is not that the summary exaggerates: it doesn’t need to. It is enough for it not to repeat what the annex has already said.',
          },
          {
            es: 'Un texto puede ser íntegramente verdadero y aun así estar construido para producir una creencia falsa.',
            en: 'A text can be wholly true and still be built to produce a false belief.',
          },
          {
            es: 'Ahora bien, eso no lo constata ningún indicador. Lo constata quien se toma la molestia de abrir el anexo IV.',
            en: 'That said, no indicator confirms that. It is confirmed by whoever takes the trouble to open Annex IV.',
          },
        ],
        question: {
          question: 'What is the text’s central claim about truthful documents?',
          questionEs: '¿Cuál es la tesis central del texto sobre los documentos veraces?',
          options: [
            'Que la selección y el orden pueden producir una creencia falsa sin ninguna afirmación falsa',
            'Que todos los informes corporativos contienen datos inventados',
            'Que los anexos son siempre más fiables que los resúmenes',
            'Que la culpa es de los lectores por no leer los anexos',
          ],
          answer: 0,
          explanation:
            '«Íntegramente verdadero y construido para producir una creencia falsa» es la tesis. No trata de mentiras sino de arquitectura: qué se pone delante, qué se pone en el anexo IV.',
        },
      },
    ],
  },
  {
    id: 'story.columna',
    title: 'Columna: en defensa del ruido',
    blurb: 'Una columna que defiende exactamente lo contrario de lo que dice defender.',
    icon: 'newspaper-outline',
    level: 'C2',
    topics: ['city', 'opinions', 'social'],
    concepts: ['g.emphasis', 'g.audience', 'p.a-todas-luces', 'p.no-cabe-duda', 'p.lejos-de', 'v.escepticismo'],
    scenes: [
      {
        lines: [
          {
            es: 'Escribo en defensa del ruido, esa gran conquista social que algunos vecinos malintencionados pretenden ahora arrebatarnos.',
            en: 'I write in defence of noise, that great social achievement which certain ill-intentioned neighbours now propose to snatch from us.',
          },
          {
            es: 'No cabe duda de que dormir está sobrevalorado. Nuestros abuelos dormían ocho horas y mírenlos: pausados, longevos, insoportablemente serenos.',
            en: 'There is no doubt that sleep is overrated. Our grandparents slept eight hours and look at them: unhurried, long-lived, unbearably serene.',
          },
          {
            es: 'A todas luces, una ciudad que calla es una ciudad que ha renunciado a vivir.',
            en: 'Plainly, a city that falls silent is a city that has given up on living.',
          },
          {
            es: 'Que se lo pregunten al bar de abajo, cuya terraza cierra, escandalosamente, a las dos y media de la madrugada.',
            en: 'Just ask the bar downstairs, whose terrace closes, scandalously, at half past two in the morning.',
          },
        ],
        question: {
          question: 'How do you know the column is ironic from the first scene alone?',
          questionEs: '¿Cómo se sabe ya en la primera escena que la columna es irónica?',
          options: [
            'Los adjetivos elogiosos describen cosas indefendibles y el «escandalosamente» va al revés',
            'Porque el autor dice explícitamente que está bromeando',
            'Porque los datos que aporta son falsos',
            'Porque el registro es coloquial y no periodístico',
          ],
          answer: 0,
          explanation:
            'La ironía se detecta en la incoherencia entre valoración y objeto: «insoportablemente serenos», «escandalosamente a las dos y media». El escándalo, en la lectura literal, sería que cierre; en la real, que cierre tan tarde.',
        },
      },
      {
        lines: [
          {
            es: 'Se dirá que hay quien madruga. Cierto, pero convendrán conmigo en que madrugar es, en el fondo, una elección estética.',
            en: 'It will be said that some people get up early. True, but you will agree with me that getting up early is, at bottom, an aesthetic choice.',
          },
          {
            es: 'Quien madruga es libre de mudarse a un pueblo, como lleva siglos haciendo la gente sensata.',
            en: 'Whoever gets up early is free to move to a village, as sensible people have been doing for centuries.',
          },
          {
            es: 'Lejos de mí sugerir que el problema sea del que no puede dormir. El problema es, sencillamente, que no ha sabido adaptarse.',
            en: 'Far be it from me to suggest the problem lies with the person who cannot sleep. The problem is simply that they have failed to adapt.',
          },
          {
            es: 'La ciudad no está para acomodarse a nadie. Para eso están las casas, que por algo tienen ventanas.',
            en: 'The city is not there to accommodate anyone. That is what houses are for, and there is a reason they have windows.',
          },
        ],
        question: {
          question: 'What is the function of “lejos de mí sugerir que…”?',
          questionEs: '¿Qué función cumple «lejos de mí sugerir que…»?',
          options: [
            'Niega formalmente lo que la frase siguiente afirma, exhibiendo la maniobra',
            'Introduce una concesión sincera al punto de vista contrario',
            'Marca el paso de la ironía a la argumentación seria',
            'Cita una objeción que el autor va a refutar con datos',
          ],
          answer: 0,
          explanation:
            'Es una preterición: se niega estar diciendo justo lo que se dice a continuación. El autor la deja tan visible que la técnica misma pasa a formar parte de la sátira.',
        },
      },
      {
        lines: [
          {
            es: 'Los detractores del ruido esgrimen estudios. Siempre esgrimen estudios.',
            en: 'The opponents of noise brandish studies. They always brandish studies.',
          },
          {
            es: 'Dicen que la exposición sostenida a más de 55 decibelios nocturnos se asocia a hipertensión. Yo digo que también se asocia a haber vivido.',
            en: 'They say sustained exposure to more than 55 night-time decibels is associated with hypertension. I say it is also associated with having lived.',
          },
          {
            es: 'Nadie ha demostrado nunca que el silencio cure nada. Nadie, tampoco, ha demostrado lo contrario, y ahí está precisamente mi punto.',
            en: 'Nobody has ever shown that silence cures anything. Nor has anybody shown the opposite, and that is precisely my point.',
          },
          {
            es: 'En materia de convivencia, el escepticismo es la única postura elegante.',
            en: 'In matters of coexistence, scepticism is the only elegant position.',
          },
        ],
        question: {
          question: 'What fallacy is being staged in this scene?',
          questionEs: '¿Qué falacia se escenifica en esta escena?',
          options: [
            'La apelación a la ignorancia: si no está demostrado lo contrario, mi posición vale igual',
            'La falsa analogía entre ruido y salud',
            'El argumento de autoridad basado en los estudios citados',
            'La generalización a partir de un caso particular',
          ],
          answer: 0,
          explanation:
            '«Nadie ha demostrado lo contrario, y ahí está mi punto» es exactamente la apelación a la ignorancia, y la columna la enuncia con orgullo para que el lector la reconozca.',
        },
      },
      {
        lines: [
          {
            es: 'Concluyo. No pido nada excesivo: solo que se deje de molestar a quienes molestan.',
            en: 'I conclude. I ask for nothing excessive: only that people stop bothering those who bother others.',
          },
          {
            es: 'Que las terrazas crezcan, que los altavoces canten, que la madrugada sea de todos y en especial de los que gritan.',
            en: 'Let the terraces grow, let the speakers sing, let the small hours belong to everyone and especially to those who shout.',
          },
          {
            es: 'Y si alguien no puede dormir, que se compre unos tapones. Cuestan tres euros. La convivencia, ya ven, es baratísima.',
            en: 'And if anyone cannot sleep, let them buy earplugs. They cost three euros. Coexistence, you see, is dirt cheap.',
          },
          {
            es: 'Firmado: un vecino del tercero, que lleva cuatro años sin dormir un martes entero.',
            en: 'Signed: a neighbour on the third floor, who has not slept through a Tuesday in four years.',
          },
        ],
        question: {
          question: 'What does the signature do to the whole piece?',
          questionEs: '¿Qué le hace la firma al texto completo?',
          options: [
            'Revela que el autor es la víctima, de modo que toda la defensa era una queja',
            'Confirma que el autor defiende sinceramente el ruido',
            'Introduce un segundo autor que contradice al primero',
            'Sugiere que el texto es una carta y no una columna',
          ],
          answer: 0,
          explanation:
            'La firma es la clave que reorganiza todo lo leído: quien firma es el que no duerme. La columna nunca defendió el ruido; simuló defenderlo para que la defensa resultara insostenible.',
        },
      },
      {
        lines: [
          {
            es: 'Lo interesante de una ironía sostenida es que no se puede refutar sin repetirla.',
            en: 'What is interesting about sustained irony is that it cannot be refuted without repeating it.',
          },
          {
            es: 'Quien responda «pero el sueño no está sobrevalorado» habrá leído la letra y no el texto.',
            en: 'Anyone who replies “but sleep isn’t overrated” will have read the letter and not the text.',
          },
          {
            es: 'De ahí que este registro sea tan eficaz en prensa y tan peligroso en un correo de trabajo: exige un lector que colabore.',
            en: 'Hence why this register works so well in the press and is so dangerous in a work email: it demands a reader who cooperates.',
          },
          {
            es: 'Sin esa colaboración, la ironía no falla a medias: falla entera, y en la dirección contraria.',
            en: 'Without that cooperation, irony does not half fail: it fails entirely, and in the opposite direction.',
          },
        ],
        question: {
          question: 'Why does the closing scene call irony “dangerous in a work email”?',
          questionEs: '¿Por qué la escena final llama a la ironía «peligrosa en un correo de trabajo»?',
          options: [
            'Porque si el lector no coopera, el texto se entiende literalmente y significa lo contrario',
            'Porque en el trabajo está prohibido el humor',
            'Porque la ironía siempre resulta ofensiva para el destinatario',
            'Porque los correos de trabajo se archivan y se pueden usar como prueba',
          ],
          answer: 0,
          explanation:
            'La ironía no lleva marca gramatical: depende por completo de que el lector reconstruya la intención. En prensa hay contexto que ayuda; en un correo suelto, no lo hay.',
        },
      },
    ],
  },
];
