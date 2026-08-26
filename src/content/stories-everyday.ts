import type { Story } from '@/content/types';

/**
 * Reading practice for the units the curriculum expansion added.
 *
 * The expansion put twenty-one new units into the course and gave none of them
 * enrichment, which the audit caught immediately: reading fell from 29% of A1's
 * units to 19%, below the quarter the modality check requires. That threshold
 * is not decoration — a stage where reading appears in one unit in five is a
 * stage of drills with a story bolted on, and the whole point of measuring
 * *reach* rather than presence was to catch exactly that.
 *
 * These are written at the level of the units they sit in, using the vocabulary
 * those units teach, so a learner meets the words again in continuous prose
 * rather than only in isolated sentences. That is the seventh step of the
 * repetition ladder — later spaced reuse — and it is the one a course usually
 * skips.
 */
export const everydayStories: Story[] = [
  {
    id: 'story.la-casa-nueva',
    title: 'La casa nueva',
    blurb: 'Ana enseña su piso nuevo por videollamada. Su madre tiene opiniones sobre todas las habitaciones.',
    icon: 'home-outline',
    level: 'A1',
    topics: ['home', 'family'],
    concepts: ['v.cocina', 'v.salon', 'v.dormitorio', 'v.ventana', 'v.encima-de', 'v.debajo-de'],
    scenes: [
      {
        lines: [
          { es: '—Mira, mamá, esta es la cocina.', en: '"Look, Mum, this is the kitchen."' },
          { es: '—Es muy pequeña, hija.', en: '"It’s very small, love."' },
          { es: '—Es pequeña, sí, pero tiene mucha luz. La ventana da al jardín.', en: '"It is small, yes, but it gets a lot of light. The window looks onto the garden."' },
        ],
        question: {
          question: 'What does Ana say in the kitchen’s defence?',
          questionEs: '¿Qué dice Ana a favor de la cocina?',
          options: ['Que tiene mucha luz', 'Que es muy grande', 'Que es nueva', 'Que está limpia'],
          answer: 0,
          explanation: 'Ana acepta que es pequeña y compensa con la luz: «Es pequeña, sí, pero tiene mucha luz.»',
        },
      },
      {
        lines: [
          { es: '—¿Y el salón?', en: '"And the living room?"' },
          { es: '—Aquí. El sofá está debajo de la ventana y la mesa encima de la alfombra.', en: '"Here. The sofa is under the window and the table is on top of the rug."' },
          { es: '—¿Y dónde está la tele?', en: '"And where’s the television?"' },
          { es: '—Todavía no tengo tele, mamá.', en: '"I don’t have a television yet, Mum."' },
        ],
        question: {
          question: 'Where is the sofa?',
          questionEs: '¿Dónde está el sofá?',
          options: ['Debajo de la ventana', 'Encima de la mesa', 'Detrás de la puerta', 'En la cocina'],
          answer: 0,
          explanation: 'Debajo de = under. El sofá está debajo de la ventana.',
        },
      },
      {
        lines: [
          { es: '—El dormitorio está arriba. Sólo hay una cama y una silla.', en: '"The bedroom is upstairs. There’s only a bed and a chair."' },
          { es: '—Necesitas un armario.', en: '"You need a wardrobe."' },
          { es: '—Necesito muchas cosas. Pero la casa ya es mía.', en: '"I need a lot of things. But the house is mine now."' },
        ],
        question: {
          question: 'How does Ana end the call?',
          questionEs: '¿Cómo termina Ana la llamada?',
          options: [
            'Reconociendo que le faltan cosas, pero contenta con la casa',
            'Enfadada con su madre',
            'Diciendo que va a mudarse otra vez',
            'Pidiendo dinero a su madre',
          ],
          answer: 0,
          explanation: '«Necesito muchas cosas. Pero la casa ya es mía.» — admite lo que falta y se queda con lo importante.',
        },
      },
    ],
  },
  {
    id: 'story.el-mercado',
    title: 'El mercado del sábado',
    blurb: 'Un sábado por la mañana, dos euros de diferencia y una conversación que dura más que la compra.',
    icon: 'bag-handle-outline',
    level: 'A1',
    topics: ['shopping', 'food'],
    concepts: ['v.mercado', 'v.precio', 'v.euro', 'v.manzana', 'v.patata', 'v.tomate'],
    scenes: [
      {
        lines: [
          { es: 'Todos los sábados Luis va al mercado a las nueve.', en: 'Every Saturday Luis goes to the market at nine.' },
          { es: 'Compra fruta, verdura y pan. Siempre en los mismos puestos.', en: 'He buys fruit, vegetables and bread. Always at the same stalls.' },
          { es: '—Buenos días, Luis. ¿Lo de siempre?', en: '"Morning, Luis. The usual?"' },
        ],
        question: {
          question: 'How often does Luis go?',
          questionEs: '¿Con qué frecuencia va Luis al mercado?',
          options: ['Todos los sábados', 'Todos los días', 'Una vez al mes', 'Los domingos'],
          answer: 0,
          explanation: '«Todos los sábados Luis va al mercado a las nueve.»',
        },
      },
      {
        lines: [
          { es: '—Un kilo de tomates y dos de patatas. ¿Cuánto es?', en: '"A kilo of tomatoes and two of potatoes. How much is that?"' },
          { es: '—Cuatro euros con cincuenta.', en: '"Four euros fifty."' },
          { es: '—La semana pasada eran cuatro.', en: '"Last week it was four."' },
          { es: '—La semana pasada no llovía, Luis.', en: '"Last week it wasn’t raining, Luis."' },
        ],
        question: {
          question: 'Why does the stallholder say the price has gone up?',
          questionEs: '¿Por qué ha subido el precio, según el vendedor?',
          options: ['Por la lluvia', 'Porque es sábado', 'Porque Luis compra mucho', 'Porque el mercado cierra'],
          answer: 0,
          explanation: '«La semana pasada no llovía» — el tiempo ha cambiado el precio.',
        },
      },
      {
        lines: [
          { es: 'Luis paga con tarjeta y coge una manzana del montón.', en: 'Luis pays by card and takes an apple from the pile.' },
          { es: '—Esa te la regalo. Hasta el sábado.', en: '"That one’s on me. See you Saturday."' },
        ],
        question: {
          question: 'How does Luis pay?',
          questionEs: '¿Cómo paga Luis?',
          options: ['Con tarjeta', 'En efectivo', 'No paga', 'Con un ticket'],
          answer: 0,
          explanation: '«Luis paga con tarjeta.»',
        },
      },
    ],
  },
  {
    id: 'story.el-barrio-cambia',
    title: 'El barrio cambia',
    blurb: 'La panadería cerró, el banco se fue, y en su sitio abrió otra cosa. Nadie se pone de acuerdo sobre si eso es bueno.',
    icon: 'earth-outline',
    level: 'A2',
    topics: ['city', 'opinions'],
    concepts: ['v.barrio', 'v.banco', 'v.cerrar', 'v.abrir', 'v.cambiar'],
    scenes: [
      {
        lines: [
          { es: 'En diez años el barrio ha cambiado mucho.', en: 'In ten years the neighbourhood has changed a lot.' },
          { es: 'La panadería de la esquina cerró en marzo.', en: 'The bakery on the corner closed in March.' },
          { es: 'El banco se fue el año pasado. Ahora hay un gimnasio.', en: 'The bank left last year. Now there’s a gym.' },
        ],
        question: {
          question: 'What is where the bank used to be?',
          questionEs: '¿Qué hay ahora donde estaba el banco?',
          options: ['Un gimnasio', 'Una panadería', 'Un parque', 'Un museo'],
          answer: 0,
          explanation: '«El banco se fue el año pasado. Ahora hay un gimnasio.»',
        },
      },
      {
        lines: [
          { es: '—Antes conocías a todo el mundo —dice Carmen—. Ahora no conozco a nadie.', en: '"You used to know everyone," says Carmen. "Now I don’t know anybody."' },
          { es: '—Pero han abierto dos bares nuevos y un parque —dice su hijo—. Eso también es el barrio.', en: '"But they’ve opened two new bars and a park," says her son. "That’s the neighbourhood too."' },
        ],
        question: {
          question: 'How do mother and son differ?',
          questionEs: '¿En qué se diferencian madre e hijo?',
          options: [
            'Ella echa de menos lo que había; él ve lo que hay',
            'Los dos quieren mudarse',
            'Ninguno de los dos vive en el barrio',
            'Él quiere que cierre el parque',
          ],
          answer: 0,
          explanation: 'Carmen habla de lo que ha perdido; su hijo, de lo que ha llegado. Ninguno tiene del todo razón.',
        },
      },
    ],
  },
  {
    id: 'story.el-viaje-que-no-fue',
    title: 'El viaje que no fue',
    blurb: 'Dos meses planeando y un vuelo perdido por siete minutos. Lo que pasó después salió mejor.',
    icon: 'flag-outline',
    level: 'B1',
    topics: ['travel', 'storytelling'],
    concepts: ['v.perder', 'v.avion', 'v.aeropuerto', 'v.llegar', 'v.equipaje'],
    scenes: [
      {
        lines: [
          { es: 'Habíamos planeado el viaje durante dos meses.', en: 'We had planned the trip for two months.' },
          { es: 'Llegamos al aeropuerto con el tiempo justo, y el tráfico hizo el resto.', en: 'We got to the airport with barely enough time, and the traffic did the rest.' },
          { es: 'Perdimos el avión por siete minutos.', en: 'We missed the plane by seven minutes.' },
        ],
        question: {
          question: 'Why did they miss the plane?',
          questionEs: '¿Por qué perdieron el avión?',
          options: ['Llegaron tarde por el tráfico', 'Se equivocaron de aeropuerto', 'Perdieron el equipaje', 'El vuelo se canceló'],
          answer: 0,
          explanation: '«Llegamos al aeropuerto con el tiempo justo, y el tráfico hizo el resto.»',
        },
      },
      {
        lines: [
          { es: 'No había otro vuelo hasta el jueves.', en: 'There was no other flight until Thursday.' },
          { es: 'Nos quedamos tres días en una ciudad que no habíamos pensado visitar.', en: 'We stayed three days in a city we had not planned to visit.' },
          { es: 'Al final resultó ser lo mejor del viaje.', en: 'In the end it turned out to be the best part of the trip.' },
        ],
        question: {
          question: 'What does the narrator conclude?',
          questionEs: '¿Qué concluye el narrador?',
          options: [
            'Que lo no planeado acabó siendo lo mejor',
            'Que no volverá a viajar',
            'Que perdieron el equipaje también',
            'Que el jueves llegaron a su destino original',
          ],
          answer: 0,
          explanation: '«Al final resultó ser lo mejor del viaje» — resultar + adjetivo es cómo el español entrega ese giro.',
        },
      },
    ],
  },
  {
    id: 'story.la-decision',
    title: 'La decisión',
    blurb: 'Una oferta de trabajo en otra ciudad, dos listas de pros y contras, y una conversación que las tira las dos.',
    icon: 'briefcase-outline',
    level: 'B2',
    topics: ['work', 'opinions'],
    concepts: ['v.suponer', 'v.mantener', 'v.resultar', 'v.desventaja', 'p.dar-por-hecho'],
    scenes: [
      {
        lines: [
          { es: 'La oferta suponía más dinero y menos tiempo libre.', en: 'The offer meant more money and less free time.' },
          { es: 'Hice dos listas. La de ventajas era más larga; la de desventajas, más pesada.', en: 'I made two lists. The advantages list was longer; the disadvantages one weighed more.' },
        ],
        question: {
          question: 'What is the narrator’s point about the two lists?',
          questionEs: '¿Qué quiere decir con lo de las dos listas?',
          options: [
            'Que contar razones no es lo mismo que pesarlas',
            'Que había más desventajas que ventajas',
            'Que no había desventajas',
            'Que las listas eran idénticas',
          ],
          answer: 0,
          explanation: '«más larga» frente a «más pesada»: el número de razones y su peso no coinciden.',
        },
      },
      {
        lines: [
          { es: '—Has dado por hecho que tienes que decidir ya —me dijo Marta.', en: '"You’ve taken it for granted that you have to decide now," Marta told me.' },
          { es: '—Que yo sepa, el plazo acaba el viernes.', en: '"As far as I know, the deadline is Friday."' },
          { es: '—Pregunta. Lo peor que puede pasar es que te digan que no.', en: '"Ask. The worst that can happen is they say no."' },
        ],
        question: {
          question: 'What does Marta challenge?',
          questionEs: '¿Qué cuestiona Marta?',
          options: [
            'Una suposición que él no había examinado',
            'Que la oferta sea buena',
            'Que Marta quiera el puesto',
            'Que el plazo exista',
          ],
          answer: 0,
          explanation: 'No discute la decisión, sino el supuesto de que hay que tomarla ya — «has dado por hecho que…».',
        },
      },
      {
        lines: [
          { es: 'Pedí dos semanas más. Me las dieron sin discutir.', en: 'I asked for two more weeks. They gave them to me without argument.' },
          { es: 'Al final dije que no, y por razones que no estaban en ninguna de las dos listas.', en: 'In the end I said no, and for reasons that were on neither list.' },
        ],
        question: {
          question: 'What happened in the end?',
          questionEs: '¿Qué pasó al final?',
          options: [
            'Rechazó la oferta por razones que no había anotado',
            'Aceptó la oferta',
            'Perdió el plazo',
            'Marta aceptó el puesto',
          ],
          answer: 0,
          explanation: '«dije que no, y por razones que no estaban en ninguna de las dos listas» — las listas no decidieron nada.',
        },
      },
    ],
  },
];
