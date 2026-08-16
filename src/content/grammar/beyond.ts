import type { GrammarConcept } from '@/content/types';

/** A2–B1 grammar: reflexives, objects, por/para and the past tenses. */
export const beyondGrammar: GrammarConcept[] = [
  {
    id: 'g.reflexive',
    kind: 'grammar',
    level: 'A2',
    topics: ['daily-routine'],
    title: 'Reflexive verbs',
    short: 'When you do something to yourself, a pronoun comes along: me, te, se…',
    summary: [
      {
        type: 'text',
        text: 'A reflexive verb points the action back at the subject. The infinitive carries -se: levantarse, ducharse, llamarse.',
      },
      {
        type: 'table',
        head: ['', 'levantarse'],
        rows: [
          ['yo', 'me levanto'],
          ['tú', 'te levantas'],
          ['él / ella', 'se levanta'],
          ['nosotros', 'nos levantamos'],
          ['vosotros', 'os levantáis'],
          ['ellos', 'se levantan'],
        ],
      },
      {
        type: 'rule',
        label: 'Where the pronoun goes',
        text: 'Before a conjugated verb (me ducho), or stuck onto an infinitive (voy a ducharme). Both are correct.',
      },
      {
        type: 'tip',
        text: 'Note the vosotros form: os levantáis. That os is Spain-only and worth drilling.',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'Many verbs shift meaning when they go reflexive — this is where the concept earns its keep.',
      },
      {
        type: 'table',
        head: ['Plain', 'Reflexive'],
        rows: [
          ['ir — to go', 'irse — to leave'],
          ['dormir — to sleep', 'dormirse — to fall asleep'],
          ['llevar — to carry', 'llevarse — to take away / get on with someone'],
          ['poner — to put', 'ponerse — to put on (clothes) / to become'],
        ],
      },
    ],
    examples: [
      { es: 'Me levanto a las siete.', en: 'I get up at seven.', highlight: ['Me'] },
      { es: '¿A qué hora os acostáis?', en: 'What time do you all go to bed?', highlight: ['os'] },
      { es: 'Me voy, que es tarde.', en: 'I’m off, it’s late.' },
    ],
    pitfalls: ['Dropping the pronoun: "levanto a las siete" means you lift something at seven.'],
    requires: ['g.present-regular'],
  },

  {
    id: 'g.object-pronouns',
    kind: 'grammar',
    level: 'B1',
    topics: ['social'],
    title: 'Direct and indirect objects',
    short: 'lo / la for the thing, le for the person it goes to.',
    summary: [
      {
        type: 'contrast',
        left: {
          title: 'Direct — lo, la, los, las',
          caption: 'What is being acted on',
          tone: 'grammar',
          examples: [
            { es: '¿El libro? Lo tengo yo.', en: 'The book? I’ve got it.' },
            { es: 'La veo mañana.', en: 'I’m seeing her tomorrow.' },
          ],
        },
        right: {
          title: 'Indirect — le, les',
          caption: 'To or for whom',
          tone: 'listening',
          examples: [
            { es: 'Le doy el libro a Marta.', en: 'I give the book to Marta.' },
            { es: 'Les mando un mensaje.', en: 'I’ll send them a message.' },
          ],
        },
      },
      {
        type: 'rule',
        label: 'Order',
        text: 'Indirect comes before direct: Te lo doy. And le + lo becomes se lo — Se lo doy a Marta.',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'In central Spain you will constantly hear le where the rule says lo, for male people: "¿A Juan? Le vi ayer." This is leísmo, it is accepted by the RAE for masculine people, and it is normal in Madrid.',
      },
      {
        type: 'warning',
        text: 'Leísmo applies to people, not things. "El libro, le tengo" is wrong everywhere.',
      },
    ],
    examples: [{ es: '¿Me lo puedes mandar?', en: 'Can you send it to me?' }],
    pitfalls: ['Putting the pronoun after a conjugated verb: "Doy le el libro" is wrong.'],
  },

  {
    id: 'g.por-para',
    kind: 'grammar',
    level: 'A2',
    topics: ['opinions', 'travel'],
    title: 'Por vs para',
    short: 'para points forward to a goal; por points back to a cause or through a means.',
    summary: [
      {
        type: 'contrast',
        left: {
          title: 'PARA →',
          caption: 'Destination, purpose, deadline, recipient',
          tone: 'success',
          examples: [
            { es: 'Es para ti.', en: 'It’s for you.' },
            { es: 'Salgo para Madrid.', en: 'I’m leaving for Madrid.' },
            { es: 'Para mañana.', en: 'By tomorrow.' },
            { es: 'Estudio para aprobar.', en: 'I study in order to pass.' },
          ],
        },
        right: {
          title: 'POR ←',
          caption: 'Cause, exchange, duration, movement through',
          tone: 'grammar',
          examples: [
            { es: 'Gracias por todo.', en: 'Thanks for everything.' },
            { es: 'Dos euros por el café.', en: 'Two euros for the coffee.' },
            { es: 'Paseo por el parque.', en: 'I walk through the park.' },
            { es: 'Por la mañana.', en: 'In the morning.' },
          ],
        },
      },
      {
        type: 'rule',
        label: 'The test',
        text: 'Can you replace it with "in order to" or "destined for"? → para. Is it "because of", "in exchange for" or "through"? → por.',
        tone: 'success',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'Some fixed pairs are worth memorising whole, because the logic is thin.',
      },
      {
        type: 'table',
        head: ['Expression', 'Meaning'],
        rows: [
          ['por favor', 'please'],
          ['por fin', 'finally'],
          ['por eso', 'that’s why'],
          ['por ejemplo', 'for example'],
          ['para siempre', 'forever'],
          ['para nada', 'not at all'],
        ],
      },
    ],
    examples: [
      { es: 'Este regalo es para mi madre.', en: 'This present is for my mother.' },
      { es: 'Lo hago por ti.', en: 'I’m doing it because of / for your sake.' },
    ],
    pitfalls: ['Using para for thanks: it is gracias por, always.'],
  },

  {
    id: 'g.preterite',
    kind: 'grammar',
    level: 'A2',
    topics: ['past', 'storytelling'],
    title: 'The preterite — finished actions',
    short: 'What happened. A single completed event in the past.',
    summary: [
      {
        type: 'text',
        text: 'The preterite tells you an action started and finished. It is the backbone of any story: ayer comí, luego salí, después volví a casa.',
      },
      {
        type: 'table',
        head: ['', '-ar (hablar)', '-er / -ir (comer)'],
        rows: [
          ['yo', 'hablé', 'comí'],
          ['tú', 'hablaste', 'comiste'],
          ['él / ella', 'habló', 'comió'],
          ['nosotros', 'hablamos', 'comimos'],
          ['vosotros', 'hablasteis', 'comisteis'],
          ['ellos', 'hablaron', 'comieron'],
        ],
      },
      {
        type: 'tip',
        text: 'Accents matter here and change who you mean: hablo (I speak) vs habló (he spoke).',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'The most common verbs are irregular, and their irregular stems take *no accents* at all.',
      },
      {
        type: 'table',
        head: ['Verb', 'yo', 'él'],
        rows: [
          ['ser / ir', 'fui', 'fue'],
          ['estar', 'estuve', 'estuvo'],
          ['tener', 'tuve', 'tuvo'],
          ['hacer', 'hice', 'hizo'],
          ['poder', 'pude', 'pudo'],
          ['querer', 'quise', 'quiso'],
        ],
      },
      {
        type: 'warning',
        text: 'ser and ir share the same preterite. Fui a Madrid = I went. Fui camarero = I was a waiter. Context decides.',
      },
    ],
    examples: [
      { es: 'Ayer comí en casa de mis padres.', en: 'Yesterday I ate at my parents’ house.' },
      { es: '¿Qué hiciste el fin de semana?', en: 'What did you do at the weekend?' },
    ],
    pitfalls: ['Forgetting the accent on hablé / habló — it changes the person.'],
  },

  {
    id: 'g.imperfect',
    kind: 'grammar',
    level: 'B1',
    topics: ['past', 'storytelling'],
    title: 'The imperfect — how things were',
    short: 'Background, habits and descriptions in the past. Only three irregulars.',
    summary: [
      {
        type: 'text',
        text: 'The imperfect sets the scene rather than moving the story on: what used to happen, what was going on, what things were like.',
      },
      {
        type: 'table',
        head: ['', '-ar (hablar)', '-er / -ir (comer)'],
        rows: [
          ['yo', 'hablaba', 'comía'],
          ['tú', 'hablabas', 'comías'],
          ['él / ella', 'hablaba', 'comía'],
          ['nosotros', 'hablábamos', 'comíamos'],
          ['vosotros', 'hablabais', 'comíais'],
          ['ellos', 'hablaban', 'comían'],
        ],
      },
      {
        type: 'rule',
        label: 'Only three irregular verbs',
        text: 'ser → era, ir → iba, ver → veía. That is the entire list.',
        tone: 'success',
      },
    ],
    examples: [
      { es: 'De pequeño vivía en Bilbao.', en: 'As a child I used to live in Bilbao.' },
      { es: 'Era tarde y estaba cansado.', en: 'It was late and I was tired.' },
    ],
    pitfalls: ['Using it for a one-off finished event — that is the preterite’s job.'],
    requires: ['g.preterite'],
  },

  {
    id: 'g.preterite-imperfect',
    kind: 'grammar',
    level: 'B1',
    topics: ['past', 'storytelling'],
    title: 'Preterite vs imperfect',
    short: 'The imperfect is the film set; the preterite is what happens on it.',
    summary: [
      {
        type: 'contrast',
        left: {
          title: 'IMPERFECT',
          caption: 'Scene, habit, ongoing',
          tone: 'listening',
          examples: [
            { es: 'Llovía y no había nadie.', en: 'It was raining and there was nobody.' },
            { es: 'Siempre íbamos a la playa.', en: 'We always used to go to the beach.' },
          ],
        },
        right: {
          title: 'PRETERITE',
          caption: 'Event, interruption, done',
          tone: 'grammar',
          examples: [
            { es: 'Entonces sonó el móvil.', en: 'Then the phone rang.' },
            { es: 'Fuimos a la playa el sábado.', en: 'We went to the beach on Saturday.' },
          ],
        },
      },
      {
        type: 'examples',
        items: [
          {
            es: 'Estaba en el bar cuando llegó Marta.',
            en: 'I was in the bar when Marta arrived.',
            note: 'Ongoing background + the event that cut into it.',
            highlight: ['Estaba', 'llegó'],
          },
        ],
      },
      {
        type: 'tip',
        text: 'Time markers help: siempre, todos los días, mientras → imperfect. Ayer, el lunes, de repente → preterite.',
      },
    ],
    examples: [
      { es: 'Iba a llamarte, pero se me olvidó.', en: 'I was going to call you, but I forgot.' },
    ],
    pitfalls: ['Choosing by how long ago it was. Duration is irrelevant — what matters is whether it is a scene or an event.'],
    requires: ['g.imperfect'],
  },

  {
    id: 'g.present-perfect',
    kind: 'grammar',
    level: 'A2',
    topics: ['past'],
    title: 'The present perfect — and why Spain loves it',
    short: 'he + participle. In Spain this covers today, this week, and "ever".',
    summary: [
      {
        type: 'text',
        text: 'Formed with haber + past participle. The participle never changes: he comido, has comido, hemos comido.',
      },
      {
        type: 'table',
        head: ['', 'haber', 'example'],
        rows: [
          ['yo', 'he', 'he comido'],
          ['tú', 'has', 'has visto'],
          ['él / ella', 'ha', 'ha llegado'],
          ['nosotros', 'hemos', 'hemos quedado'],
          ['vosotros', 'habéis', 'habéis salido'],
          ['ellos', 'han', 'han venido'],
        ],
      },
      {
        type: 'rule',
        label: 'The Spain difference',
        text: 'In Spain, anything inside the current day, week, month or year usually takes the present perfect. Hoy he comido tarde — a Latin American speaker would more likely say hoy comí tarde.',
        tone: 'success',
      },
      {
        type: 'tip',
        text: 'Irregular participles worth knowing: hacer → hecho, ver → visto, escribir → escrito, decir → dicho, volver → vuelto.',
      },
    ],
    examples: [
      { es: 'Esta mañana he ido al médico.', en: 'This morning I went to the doctor.' },
      { es: 'Hemos quedado a las ocho.', en: 'We’re meeting at eight.', note: 'A plan already agreed.' },
      { es: '¿Has estado alguna vez en Granada?', en: 'Have you ever been to Granada?' },
    ],
    pitfalls: ['Making the participle agree — it is he comido, never he comida.'],
  },

  {
    id: 'g.commands',
    kind: 'grammar',
    level: 'B1',
    topics: ['directions', 'social'],
    title: 'Telling someone what to do',
    short: 'Informal commands are easy; the negative ones borrow from the subjunctive.',
    summary: [
      {
        type: 'contrast',
        left: {
          title: 'Do it (tú)',
          caption: 'Same as the él form',
          tone: 'success',
          examples: [
            { es: 'Habla más despacio.', en: 'Speak more slowly.' },
            { es: 'Come algo.', en: 'Eat something.' },
            { es: 'Gira a la derecha.', en: 'Turn right.' },
          ],
        },
        right: {
          title: 'Don’t do it (tú)',
          caption: 'Swap the vowel: -a ↔ -e',
          tone: 'danger',
          examples: [
            { es: 'No hables tan rápido.', en: 'Don’t speak so fast.' },
            { es: 'No comas eso.', en: 'Don’t eat that.' },
          ],
        },
      },
      {
        type: 'tip',
        text: 'Vosotros commands are the easy ones: drop the -r of the infinitive and add -d. Venid, comed, escuchad. In casual speech people often just use the infinitive: ¡Venir ya!',
      },
      {
        type: 'text',
        text: 'Irregular tú commands to memorise: ven, ten, pon, haz, di, sal, sé, ve.',
      },
    ],
    examples: [
      { es: 'Perdona, dime una cosa.', en: 'Sorry, tell me something.' },
      { es: 'Sigue todo recto y gira a la izquierda.', en: 'Carry straight on and turn left.' },
    ],
    pitfalls: ['Using the negative form for a positive command: "No habla" means "he doesn’t speak".'],
  },

  {
    id: 'g.subjunctive-intro',
    kind: 'grammar',
    level: 'B1',
    topics: ['opinions'],
    title: 'First contact with the subjunctive',
    short: 'Used after wishes, doubts and emotions — when something is not stated as fact.',
    summary: [
      {
        type: 'text',
        text: 'The subjunctive is not a tense; it is a mood. Spanish switches into it when a clause reports something wanted, doubted or reacted to rather than asserted.',
      },
      {
        type: 'rule',
        label: 'The trigger',
        text: 'Two different subjects + a verb of wanting, doubting or feeling + que → subjunctive.',
      },
      {
        type: 'examples',
        items: [
          { es: 'Quiero que vengas.', en: 'I want you to come.', highlight: ['vengas'] },
          { es: 'Espero que te guste.', en: 'I hope you like it.', highlight: ['guste'] },
          { es: 'No creo que sea buena idea.', en: 'I don’t think it’s a good idea.', highlight: ['sea'] },
        ],
      },
      {
        type: 'text',
        text: 'Forming it: take the yo form of the present, drop the -o, and swap the vowel. hablo → hable, como → coma, tengo → tenga.',
      },
      {
        type: 'tip',
        text: 'Same subject? No subjunctive needed — just an infinitive. Quiero ir, not quiero que yo vaya.',
      },
    ],
    examples: [
      { es: 'Ojalá haga buen tiempo mañana.', en: 'Hopefully the weather’s good tomorrow.' },
    ],
    pitfalls: ['Using it after creo que in the positive — that one stays indicative: creo que es buena idea.'],
    requires: ['g.present-regular'],
  },
];
