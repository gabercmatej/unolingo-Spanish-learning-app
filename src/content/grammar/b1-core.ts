import type { GrammarConcept } from '@/content/types';

/**
 * B1 grammar the course was missing: the simple future, the conditional, the
 * pluperfect, impersonal `se`, and relative clauses.
 *
 * These are what turn A2's connected sentences into B1's connected *paragraphs*
 * — speculating, hypothesising, referring back, and talking about what people
 * in general do.
 */
export const b1CoreGrammar: GrammarConcept[] = [
  {
    id: 'g.future',
    kind: 'grammar',
    level: 'B1',
    topics: ['plans', 'opinions'],
    title: 'The future, and guessing out loud',
    short: 'One set of endings on the whole infinitive — and Spain uses it to speculate.',
    requires: ['g.ir-a-infinitive'],
    summary: [
      {
        type: 'rule',
        label: 'Built on the infinitive',
        text: 'Unlike every other tense, the endings attach to the full infinitive, not a stem: hablaré, comerás, vivirá. The same endings for -ar, -er and -ir.',
      },
      {
        type: 'table',
        head: ['Person', 'hablar', 'Person', 'hablar'],
        rows: [
          ['yo', 'hablaré', 'nosotros', 'hablaremos'],
          ['tú', 'hablarás', 'vosotros', 'hablaréis'],
          ['él / ella', 'hablará', 'ellos', 'hablarán'],
        ],
      },
      {
        type: 'contrast',
        left: {
          title: 'ir a + infinitivo',
          caption: 'Planned, near, spoken',
          tone: 'listening',
          examples: [
            { es: 'Voy a llamarle esta tarde.', en: "I'm going to call him this afternoon." },
          ],
        },
        right: {
          title: 'futuro simple',
          caption: 'Distant, formal, or a guess',
          tone: 'grammar',
          examples: [
            { es: 'El año que viene viviré en Madrid.', en: "Next year I'll live in Madrid." },
            { es: 'Serán las tres.', en: "It must be about three." },
          ],
        },
      },
      {
        type: 'tip',
        text: 'The speculative use is everywhere in speech: ¿Dónde está Ana? — Estará en el metro. "She\'ll be on the metro" = "she\'s probably on the metro".',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'Twelve common verbs use an irregular stem, but the endings never change.',
      },
      {
        type: 'table',
        head: ['Verb', 'Stem', 'Example'],
        rows: [
          ['tener', 'tendr-', 'tendré'],
          ['poder', 'podr-', 'podrás'],
          ['hacer', 'har-', 'hará'],
          ['decir', 'dir-', 'diremos'],
          ['salir', 'saldr-', 'saldréis'],
          ['querer', 'querr-', 'querrán'],
        ],
      },
    ],
    examples: [
      { es: 'Mañana te lo diré.', en: "I'll tell you tomorrow.", highlight: ['diré'] },
      { es: 'No sé, estará durmiendo.', en: "I don't know, he's probably asleep.", highlight: ['estará'] },
    ],
    pitfalls: ['Cutting the infinitive before adding the ending — it is hablaré, not "hablé".'],
  },

  {
    id: 'g.conditional',
    kind: 'grammar',
    level: 'B1',
    topics: ['opinions', 'social'],
    title: 'Would',
    short: 'Future stems, imperfect endings — for politeness, advice and hypotheticals.',
    requires: ['g.future'],
    summary: [
      {
        type: 'rule',
        label: 'A shortcut worth knowing',
        text: 'Take the future stem and add the imperfect -er endings: -ía, -ías, -ía, -íamos, -íais, -ían. If you know the future, you already know the conditional.',
      },
      {
        type: 'examples',
        items: [
          { es: '¿Podrías ayudarme?', en: 'Could you help me?', note: 'Politeness — the most common use by far.' },
          { es: 'Yo que tú, hablaría con ella.', en: "If I were you, I'd talk to her.", note: 'Advice.' },
          { es: 'Me gustaría vivir en el norte.', en: "I'd like to live in the north.", note: 'Softened wish.' },
          { es: 'Serían las dos cuando llegó.', en: 'It must have been two when he arrived.', note: 'Guessing about the past.' },
        ],
      },
      {
        type: 'tip',
        text: 'Querría and me gustaría are how you stop sounding blunt. Quiero un café is fine in a bar; querría un café is what you say in a bank.',
      },
    ],
    examples: [
      { es: '¿Te importaría cerrar la ventana?', en: 'Would you mind closing the window?', highlight: ['importaría'] },
      { es: 'Yo no diría eso.', en: "I wouldn't say that.", highlight: ['diría'] },
    ],
    pitfalls: ['Using the conditional for "used to" — that is the imperfect, not "would" in the habitual sense.'],
  },

  {
    id: 'g.pluperfect',
    kind: 'grammar',
    level: 'B1',
    topics: ['past', 'storytelling'],
    title: 'What had already happened',
    short: 'había + participle — the past behind the past.',
    requires: ['g.present-perfect', 'g.imperfect'],
    summary: [
      {
        type: 'rule',
        label: 'One step further back',
        text: 'Imperfect of haber plus the participle: había, habías, había, habíamos, habíais, habían + hablado / comido / vivido.',
      },
      {
        type: 'text',
        text: 'It marks the earlier of two past events, which is what lets a story stop being a flat list of things that happened.',
      },
      {
        type: 'examples',
        items: [
          {
            es: 'Cuando llegué, ya se habían ido.',
            en: 'When I arrived, they had already left.',
            note: 'The leaving happened before the arriving.',
          },
          {
            es: 'No sabía que habías estudiado en Salamanca.',
            en: "I didn't know you'd studied in Salamanca.",
          },
        ],
      },
      { type: 'tip', text: 'ya and todavía no sit naturally with it: ya había comido, todavía no había llegado.' },
    ],
    examples: [
      { es: 'Ya había cenado cuando me llamaste.', en: "I'd already had dinner when you called me.", highlight: ['había cenado'] },
    ],
    pitfalls: ['Splitting haber from the participle — nothing goes between them in Spanish.'],
  },

  {
    id: 'g.se-impersonal',
    kind: 'grammar',
    level: 'B1',
    topics: ['opinions', 'city'],
    title: 'What people do',
    short: 'se + verb, for when who did it does not matter.',
    requires: ['g.reflexive'],
    summary: [
      {
        type: 'text',
        text: 'Spanish avoids the passive far more than English. Where English says "it is spoken" or "you can\'t park here", Spanish reaches for se.',
      },
      {
        type: 'contrast',
        left: {
          title: 'se impersonal',
          caption: 'People in general. Verb stays singular.',
          tone: 'grammar',
          examples: [
            { es: 'Aquí se come muy bien.', en: 'The food here is great.' },
            { es: '¿Cómo se dice esto en español?', en: 'How do you say this in Spanish?' },
          ],
        },
        right: {
          title: 'se pasiva',
          caption: 'Verb agrees with the thing.',
          tone: 'listening',
          examples: [
            { es: 'Se habla español.', en: 'Spanish spoken.' },
            { es: 'Se venden pisos.', en: 'Flats for sale.' },
          ],
        },
      },
      {
        type: 'rule',
        label: 'Accidental se',
        text: 'Spain uses it to shed blame: se me ha roto, se me olvidó. Not "I broke it" but "it broke on me" — and it is the normal way to say it, not an excuse.',
      },
    ],
    examples: [
      { es: 'Se me ha olvidado el móvil.', en: "I've forgotten my phone.", highlight: ['Se me ha olvidado'] },
      { es: 'En España se cena muy tarde.', en: 'In Spain people eat dinner very late.', highlight: ['se cena'] },
    ],
    pitfalls: ['Making the verb plural in the impersonal use: aquí se come, never "aquí se comen".'],
  },

  {
    id: 'g.relatives',
    kind: 'grammar',
    level: 'B1',
    topics: ['describing', 'storytelling'],
    title: 'The one that, the person who',
    short: 'que for almost everything, and the few places it will not do.',
    summary: [
      {
        type: 'rule',
        label: 'que does most of the work',
        text: 'One word for who, which and that: el chico que vive arriba, la película que vimos. Unlike English, it can never be dropped — "the film we saw" must be la película que vimos.',
      },
      {
        type: 'table',
        head: ['Use', 'Word', 'Example'],
        rows: [
          ['general', 'que', 'el libro que leí'],
          ['after a preposition, things', 'el que / la que', 'la casa en la que vivo'],
          ['after a preposition, people', 'quien / el que', 'la chica con quien hablé'],
          ['possession', 'cuyo', 'el autor cuyo libro leí'],
          ['a whole idea', 'lo que', 'lo que me dijiste'],
        ],
      },
      {
        type: 'tip',
        text: 'lo que is the one to master: it refers to a whole situation rather than a noun. No entiendo lo que quieres decir.',
      },
    ],
    examples: [
      { es: 'El piso que alquilamos está en Lavapiés.', en: 'The flat we rented is in Lavapiés.', highlight: ['que'] },
      { es: 'Eso es lo que quería decir.', en: "That's what I meant.", highlight: ['lo que'] },
    ],
    pitfalls: [
      'Dropping que the way English drops "that".',
      'Using qué with an accent — the relative has no accent.',
    ],
  },
];
