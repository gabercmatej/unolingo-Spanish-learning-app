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
];
