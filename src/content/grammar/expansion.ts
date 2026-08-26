import type { GrammarConcept } from '@/content/types';

/**
 * Two grammar points the coverage audit found missing outright.
 *
 * Obligation and the passive are not refinements — they are load-bearing. A
 * learner without *tener que* and *hay que* cannot say a single thing they are
 * obliged to do, and a learner without the *se* passive cannot read a sign, a
 * recipe, a notice or a newspaper headline, because that is the form Spanish
 * uses for all four. The course taught both patterns incidentally, inside
 * sentences, with no concept behind them — so neither could be practised,
 * scheduled or looked up.
 */
export const expansionGrammar: GrammarConcept[] = [
  {
    id: 'g.obligation',
    kind: 'grammar',
    level: 'A2',
    topics: ['plans', 'daily-routine'],
    title: 'Tener que, hay que, deber',
    short: 'Three ways to say something has to happen, and who it falls on.',
    summary: [
      {
        type: 'text',
        text: 'Spanish separates an obligation that has an owner from one that does not.',
      },
      {
        type: 'contrast',
        left: {
          title: 'TENER QUE',
          caption: 'Somebody in particular has to',
          tone: 'grammar',
          examples: [
            { es: 'Tengo que irme.', en: 'I have to go.', highlight: ['Tengo que'] },
            { es: 'Tienes que llamar al médico.', en: 'You have to call the doctor.', highlight: ['Tienes que'] },
          ],
        },
        right: {
          title: 'HAY QUE',
          caption: 'It has to be done — by nobody in particular',
          tone: 'listening',
          examples: [
            { es: 'Hay que cerrar la puerta.', en: 'The door has to be closed.', highlight: ['Hay que'] },
            { es: 'Hay que llegar antes de las nueve.', en: 'One has to arrive before nine.', highlight: ['Hay que'] },
          ],
        },
      },
      {
        type: 'rule',
        label: 'Both take a bare infinitive',
        text: 'tener que / hay que / deber + infinitivo. Never a conjugated verb after them.',
        tone: 'success',
      },
      {
        type: 'rule',
        label: 'deber is softer, and moralised',
        text: 'Debo estudiar is closer to "I ought to" than "I must". In the conditional it becomes advice: deberías descansar.',
        tone: 'grammar',
      },
      {
        type: 'warning',
        text: 'Hay que never conjugates. "Hemos que" is not Spanish — for a specific person, use tener que.',
      },
    ],
    examples: [
      { es: 'Tengo que trabajar el sábado.', en: 'I have to work on Saturday.' },
      { es: 'Hay que reservar con antelación.', en: 'You have to book in advance.' },
      { es: 'Deberías descansar un poco.', en: 'You should rest a bit.' },
    ],
    pitfalls: [
      '"Tengo que voy" — the second verb stays in the infinitive: tengo que ir.',
      'Using hay que when you mean a specific person: "Hay que irme" should be "Tengo que irme".',
    ],
  },
  {
    id: 'g.passive-se',
    kind: 'grammar',
    level: 'B2',
    topics: ['work', 'city'],
    title: 'The passive, and the se that replaces it',
    short: 'Spanish prefers se vende to es vendido — the passive with ser is rarer than English leads you to expect.',
    summary: [
      {
        type: 'text',
        text: 'English reaches for the passive constantly. Spanish usually reaches for se instead, and a learner who translates the English structure directly sounds like a translation.',
      },
      {
        type: 'contrast',
        left: {
          title: 'SE + VERB',
          caption: 'The everyday choice — signs, notices, recipes, rules',
          tone: 'success',
          examples: [
            { es: 'Se vende piso.', en: 'Flat for sale.', highlight: ['Se vende'] },
            { es: 'Aquí se habla español.', en: 'Spanish is spoken here.', highlight: ['se habla'] },
            { es: 'Se ruega silencio.', en: 'Silence is requested.', highlight: ['Se ruega'] },
          ],
        },
        right: {
          title: 'SER + PARTICIPIO',
          caption: 'Formal, and usually only when the agent matters',
          tone: 'grammar',
          examples: [
            { es: 'La ley fue aprobada por el Parlamento.', en: 'The law was passed by Parliament.', highlight: ['fue aprobada'] },
            { es: 'El edificio fue construido en 1920.', en: 'The building was built in 1920.', highlight: ['fue construido'] },
          ],
        },
      },
      {
        type: 'rule',
        label: 'The verb agrees with the thing, not with se',
        text: 'Se vende piso / Se venden pisos. The noun is the grammatical subject, so a plural noun takes a plural verb.',
        tone: 'success',
      },
      {
        type: 'rule',
        label: 'The participle agrees too',
        text: 'With ser, the participle behaves like an adjective: fue aprobada, fueron aprobadas.',
        tone: 'grammar',
      },
      {
        type: 'tip',
        text: 'If you can say who did it and it matters, ser + participio is available. If it does not matter — and in a notice it never does — use se.',
      },
    ],
    examples: [
      { es: 'Se necesita camarero con experiencia.', en: 'Experienced waiter needed.' },
      { es: 'Se permiten perros en la terraza.', en: 'Dogs are allowed on the terrace.' },
      { es: 'Las obras fueron terminadas en marzo.', en: 'The works were finished in March.' },
    ],
    pitfalls: [
      '"Es hablado español aquí" — the English structure carried straight across. Spanish says se habla español.',
      'Forgetting the agreement: "Se vende pisos" should be "Se venden pisos".',
    ],
    requires: ['g.hay-estar'],
  },
];
