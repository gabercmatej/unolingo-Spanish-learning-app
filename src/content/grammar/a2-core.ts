import type { GrammarConcept } from '@/content/types';

/**
 * A2 grammar the course was missing: comparison, and the muy/mucho split that
 * every English speaker gets wrong for months.
 *
 * Both are attached to things people actually argue about — which city is
 * better, whether it is too expensive — rather than presented as tables.
 */
export const a2CoreGrammar: GrammarConcept[] = [
  {
    id: 'g.comparisons',
    kind: 'grammar',
    level: 'A2',
    topics: ['describing', 'opinions', 'shopping'],
    title: 'More, less, the best',
    short: 'más… que, menos… que, and the four irregulars worth memorising.',
    requires: ['g.adjective-agreement'],
    summary: [
      {
        type: 'rule',
        label: 'The pattern',
        text: 'más / menos + adjective + que. Madrid es más grande que Sevilla. There is no separate "-er" ending to learn.',
      },
      {
        type: 'contrast',
        left: {
          title: 'Not equal',
          caption: 'más / menos … que',
          tone: 'grammar',
          examples: [
            { es: 'Este piso es más caro que el otro.', en: 'This flat is more expensive than the other one.' },
            { es: 'Hoy hace menos frío que ayer.', en: "It's less cold today than yesterday." },
          ],
        },
        right: {
          title: 'Equal',
          caption: 'tan … como',
          tone: 'listening',
          examples: [
            { es: 'Sevilla es tan bonita como Granada.', en: 'Seville is as pretty as Granada.' },
            { es: 'No es tan difícil como parece.', en: "It's not as hard as it looks." },
          ],
        },
      },
      {
        type: 'table',
        head: ['Adjective', 'Comparative', 'Meaning'],
        rows: [
          ['bueno', 'mejor', 'better'],
          ['malo', 'peor', 'worse'],
          ['grande', 'mayor', 'older / greater'],
          ['pequeño', 'menor', 'younger / lesser'],
        ],
      },
      {
        type: 'rule',
        label: 'The best of all',
        text: 'For the superlative, add the article: el más caro, la mejor tapa de Madrid. Note it is de, not "en" — the best in Madrid is la mejor de Madrid.',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'Comparing quantities rather than qualities uses the same frame, with the noun in the middle.',
      },
      {
        type: 'examples',
        items: [
          { es: 'Tengo más tiempo que tú.', en: 'I have more time than you.' },
          { es: 'Hay menos gente que ayer.', en: 'There are fewer people than yesterday.' },
        ],
      },
      {
        type: 'warning',
        text: 'Before a number, que becomes de: más de veinte euros, not "más que veinte euros".',
      },
    ],
    examples: [
      { es: 'El metro es más rápido que el autobús.', en: 'The metro is faster than the bus.', highlight: ['más', 'que'] },
      { es: 'Esta es la mejor tortilla del barrio.', en: 'This is the best tortilla in the neighbourhood.', highlight: ['la mejor'] },
      { es: 'Cuesta más de cincuenta euros.', en: 'It costs more than fifty euros.', highlight: ['más de'] },
    ],
    pitfalls: [
      'Saying "más bueno" — the word is mejor.',
      'Using que before a number instead of de.',
    ],
  },

  {
    id: 'g.muy-mucho',
    kind: 'grammar',
    level: 'A2',
    topics: ['describing'],
    title: 'Muy or mucho',
    short: 'muy stretches a quality, mucho counts a quantity.',
    summary: [
      {
        type: 'contrast',
        left: {
          title: 'muy',
          caption: 'Before an adjective or adverb. Never changes.',
          tone: 'grammar',
          examples: [
            { es: 'Estoy muy cansado.', en: "I'm very tired." },
            { es: 'Habla muy rápido.', en: 'He speaks very fast.' },
          ],
        },
        right: {
          title: 'mucho',
          caption: 'With a noun or after a verb. Agrees with a noun.',
          tone: 'listening',
          examples: [
            { es: 'Tengo mucho trabajo.', en: 'I have a lot of work.' },
            { es: 'Hay mucha gente.', en: 'There are a lot of people.' },
            { es: 'Me gusta mucho.', en: 'I like it a lot.' },
          ],
        },
      },
      {
        type: 'tip',
        text: 'The test: if English would say "very", use muy. If it would say "a lot" or "much/many", use mucho.',
      },
      {
        type: 'warning',
        text: 'Two fixed exceptions where Spanish uses mucho and English uses "very": mucho frío and mucho calor. Tengo mucho frío, never "muy frío" — because frío is a noun there, not an adjective.',
      },
    ],
    examples: [
      { es: 'Hace mucho calor y estoy muy cansado.', en: "It's very hot and I'm very tired.", highlight: ['mucho', 'muy'] },
      { es: 'Hay muchos turistas en agosto.', en: 'There are a lot of tourists in August.', highlight: ['muchos'] },
    ],
    pitfalls: ['Saying "muy mucho", or "tengo muy frío".'],
  },
];
