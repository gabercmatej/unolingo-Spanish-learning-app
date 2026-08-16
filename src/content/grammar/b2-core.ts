import type { GrammarConcept } from '@/content/types';

/**
 * B2 grammar — but framed by what it lets you *do*, not by the paradigm.
 *
 * Each card here exists because a communicative move needs it: disagreeing
 * without sounding blunt needs the subjunctive after negated opinion,
 * hypothesising needs si + imperfect subjunctive, and passing on what someone
 * said needs the tense shift of reported speech.
 */
export const b2CoreGrammar: GrammarConcept[] = [
  {
    id: 'g.subjunctive-opinion',
    kind: 'grammar',
    level: 'B2',
    topics: ['opinions'],
    title: 'Disagreeing without being blunt',
    short: 'Negate an opinion verb and the next verb goes subjunctive.',
    requires: ['g.subjunctive-intro'],
    summary: [
      {
        type: 'text',
        text: 'This is the single most useful subjunctive rule in conversation, because Spanish marks disagreement grammatically.',
      },
      {
        type: 'contrast',
        left: {
          title: 'Asserting — indicative',
          caption: 'You are presenting it as fact',
          tone: 'listening',
          examples: [
            { es: 'Creo que tiene razón.', en: 'I think he’s right.' },
            { es: 'Está claro que funciona.', en: 'It’s clear that it works.' },
          ],
        },
        right: {
          title: 'Denying — subjunctive',
          caption: 'You are holding it at arm’s length',
          tone: 'grammar',
          examples: [
            { es: 'No creo que tenga razón.', en: 'I don’t think he’s right.' },
            { es: 'No está claro que funcione.', en: 'It’s not clear that it works.' },
          ],
        },
      },
      {
        type: 'rule',
        label: 'The pattern',
        text: 'Affirmative opinion → indicative. Negated opinion → subjunctive. creo que viene, but no creo que venga.',
      },
      {
        type: 'tip',
        text: 'It also softens. No creo que sea buena idea lands far more gently than es una mala idea, which is why Spaniards reach for it constantly in disagreement.',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'Emotion and value judgements take the subjunctive whether negated or not, because they react to a fact rather than assert one.',
      },
      {
        type: 'examples',
        items: [
          { es: 'Me molesta que siempre llegue tarde.', en: 'It annoys me that he’s always late.' },
          { es: 'Es una pena que no puedas venir.', en: 'It’s a shame you can’t come.' },
          { es: 'No me parece que sea justo.', en: 'It doesn’t seem fair to me.' },
        ],
      },
    ],
    examples: [
      { es: 'No creo que sea tan sencillo.', en: 'I don’t think it’s that simple.', highlight: ['sea'] },
      { es: 'No digo que esté mal, pero…', en: 'I’m not saying it’s wrong, but…', highlight: ['esté'] },
    ],
    pitfalls: ['Leaving the indicative after a negated opinion — "no creo que tiene" is the classic tell.'],
  },

  {
    id: 'g.si-hypothetical',
    kind: 'grammar',
    level: 'B2',
    topics: ['opinions', 'plans'],
    title: 'What would you do?',
    short: 'si + imperfect subjunctive, then conditional — for the unreal.',
    requires: ['g.conditional'],
    summary: [
      {
        type: 'contrast',
        left: {
          title: 'Real condition',
          caption: 'si + present → future / present',
          tone: 'listening',
          examples: [
            { es: 'Si llueve, no vamos.', en: 'If it rains, we won’t go.' },
            { es: 'Si puedes, llámame.', en: 'If you can, call me.' },
          ],
        },
        right: {
          title: 'Unreal condition',
          caption: 'si + imperfect subjunctive → conditional',
          tone: 'grammar',
          examples: [
            { es: 'Si tuviera tiempo, aprendería ruso.', en: 'If I had time, I’d learn Russian.' },
            { es: 'Si fuera tú, no lo haría.', en: 'If I were you, I wouldn’t do it.' },
          ],
        },
      },
      {
        type: 'rule',
        label: 'Building the imperfect subjunctive',
        text: 'Take the ellos preterite, drop -ron, add -ra: hablaron → hablara, tuvieron → tuviera, fueron → fuera. Every verb, no exceptions — including the irregular ones.',
      },
      {
        type: 'warning',
        text: 'Never si + conditional. "Si tendría tiempo" is the mistake Spaniards notice instantly; it must be si tuviera.',
      },
      {
        type: 'tip',
        text: 'The -se forms (hablase, tuviese) mean exactly the same and are common in writing and in Spain generally. Recognise both, produce either.',
      },
    ],
    examples: [
      { es: '¿Qué harías si te tocara la lotería?', en: 'What would you do if you won the lottery?', highlight: ['tocara', 'harías'] },
      { es: 'Si hubiera sabido, no habría venido.', en: 'If I’d known, I wouldn’t have come.' },
    ],
    pitfalls: ['si + conditional.', 'Forgetting that ojalá takes the same subjunctive: ojalá pudiera.'],
  },

  {
    id: 'g.reported-speech',
    kind: 'grammar',
    level: 'B2',
    topics: ['storytelling', 'opinions'],
    title: 'Passing on what someone said',
    short: 'Shift the tense back one step, and everything else with it.',
    requires: ['g.imperfect', 'g.pluperfect'],
    summary: [
      {
        type: 'text',
        text: 'When the reporting verb is in the past, the reported verb moves one step further back — and the pronouns, times and places move with it.',
      },
      {
        type: 'table',
        head: ['Direct', 'Becomes', 'Example'],
        rows: [
          ['present', 'imperfect', '«Estoy cansado» → Dijo que estaba cansado'],
          ['preterite / perfect', 'pluperfect', '«Lo hice» → Dijo que lo había hecho'],
          ['future', 'conditional', '«Vendré» → Dijo que vendría'],
          ['imperative', 'subjunctive', '«Ven» → Me dijo que viniera'],
        ],
      },
      {
        type: 'rule',
        label: 'Everything else shifts too',
        text: 'hoy → aquel día, mañana → al día siguiente, aquí → allí, este → aquel. Reporting is not just about the verb.',
      },
      {
        type: 'tip',
        text: 'If what was said is still true, Spaniards often leave the present: Dice que está cansado. The shift is obligatory only when the reporting verb is past and the situation has moved on.',
      },
    ],
    examples: [
      { es: 'Me dijo que no podía venir al día siguiente.', en: 'He told me he couldn’t come the next day.', highlight: ['podía'] },
      { es: 'Preguntó si habíamos terminado.', en: 'She asked whether we had finished.', highlight: ['habíamos terminado'] },
    ],
    pitfalls: ['Keeping the original tense after a past reporting verb.', 'Using que before an embedded yes/no question — it is preguntó si, not "preguntó que si" in careful speech.'],
  },

  {
    id: 'g.register',
    kind: 'grammar',
    level: 'B2',
    topics: ['social', 'work'],
    title: 'Reading the room',
    short: 'The same request in three registers, and when each one lands.',
    summary: [
      {
        type: 'text',
        text: 'At B2 the error stops being grammatical and starts being social. The same content can be too blunt or absurdly stiff depending on who you say it to.',
      },
      {
        type: 'table',
        head: ['Register', 'Asking for the same thing'],
        rows: [
          ['Colloquial', '¿Me pasas el informe?'],
          ['Neutral', '¿Puedes pasarme el informe?'],
          ['Polite', '¿Podrías pasarme el informe cuando puedas?'],
          ['Formal', 'Le agradecería que me enviara el informe.'],
        ],
      },
      {
        type: 'rule',
        label: 'Spain tutea more than you expect',
        text: 'Usted is for officials, much older strangers and formal writing. Using it with a colleague of your own age can create distance you did not intend.',
      },
      {
        type: 'tip',
        text: 'Softeners do most of the work: a ver, la verdad es que, si te parece, no sé, oye. They buy time and take the edge off.',
      },
    ],
    examples: [
      { es: 'Oye, ¿te importa si abro la ventana?', en: 'Hey, do you mind if I open the window?', highlight: ['te importa si'] },
      { es: 'Le agradecería que me confirmara la cita.', en: 'I’d be grateful if you could confirm the appointment.', highlight: ['agradecería', 'confirmara'] },
    ],
    pitfalls: ['Translating English politeness word for word — "¿puedo tener…?" is not how Spanish asks for things.'],
  },
];
