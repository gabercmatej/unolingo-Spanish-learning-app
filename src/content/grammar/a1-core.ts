import type { GrammarConcept } from '@/content/types';

/**
 * The A1 grammar the Foundations stage was missing: articles and plurals,
 * possessives, demonstratives, the number system and dates.
 *
 * Each is attached to something the learner actually does — buying one of
 * something, naming their family, pointing at a pastry — rather than presented
 * as a paradigm to memorise.
 */
export const a1CoreGrammar: GrammarConcept[] = [
  {
    id: 'g.articles',
    kind: 'grammar',
    level: 'A0',
    topics: ['describing', 'shopping'],
    title: 'The and a',
    short: 'Four words for "the", four for "a" — they match the noun.',
    requires: ['g.gender'],
    summary: [
      {
        type: 'text',
        text: 'English has one "the" and one "a". Spanish has four of each, because the article carries the gender and number of the noun.',
      },
      {
        type: 'table',
        head: ['', 'the', 'a / some'],
        rows: [
          ['masculine singular', 'el coche', 'un coche'],
          ['feminine singular', 'la casa', 'una casa'],
          ['masculine plural', 'los coches', 'unos coches'],
          ['feminine plural', 'las casas', 'unas casas'],
        ],
      },
      {
        type: 'rule',
        label: 'Two contractions are compulsory',
        text: 'a + el becomes al, and de + el becomes del. Voy al bar. La puerta del piso. Never "a el" or "de el".',
      },
      {
        type: 'tip',
        text: 'Spanish uses el / la far more than English uses "the": Me gusta el café. No me gusta el fútbol.',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'Where the two languages disagree about whether an article is needed at all:',
      },
      {
        type: 'contrast',
        left: {
          title: 'Spanish adds it',
          caption: 'General statements, times, days',
          tone: 'grammar',
          examples: [
            { es: 'Me gusta el vino.', en: 'I like wine.' },
            { es: 'Son las tres.', en: "It's three o'clock." },
            { es: 'Trabajo el lunes.', en: 'I work on Monday.' },
          ],
        },
        right: {
          title: 'Spanish drops it',
          caption: 'Jobs and nationalities after ser',
          tone: 'listening',
          examples: [
            { es: 'Soy profesor.', en: "I'm a teacher." },
            { es: 'Es española.', en: "She's Spanish." },
          ],
        },
      },
    ],
    examples: [
      { es: 'Quiero un café, por favor.', en: 'I want a coffee, please.', highlight: ['un'] },
      { es: 'La tortilla está muy buena.', en: 'The tortilla is very good.', highlight: ['La'] },
      { es: 'Vamos al parque.', en: "Let's go to the park.", highlight: ['al'] },
    ],
    pitfalls: [
      'Saying "Soy un profesor" — after ser, jobs take no article.',
      'Writing "a el" or "de el" instead of al and del.',
    ],
  },

  {
    id: 'g.plurals',
    kind: 'grammar',
    level: 'A0',
    topics: ['describing'],
    title: 'Making things plural',
    short: 'Add -s after a vowel, -es after a consonant.',
    requires: ['g.gender'],
    summary: [
      {
        type: 'table',
        head: ['Ending', 'Add', 'Example'],
        rows: [
          ['vowel', '-s', 'la casa → las casas'],
          ['consonant', '-es', 'el color → los colores'],
          ['-z', '-ces', 'el lápiz → los lápices'],
        ],
      },
      {
        type: 'rule',
        label: 'Everything moves together',
        text: 'The article, the noun and the adjective all go plural at once: la casa blanca → las casas blancas.',
      },
      {
        type: 'tip',
        text: 'A written accent on the last syllable disappears in the plural, because the stress no longer needs marking: el jamón → los jamones.',
      },
    ],
    examples: [
      { es: 'Tengo dos hermanos.', en: 'I have two brothers.', highlight: ['hermanos'] },
      { es: 'Los coches son caros.', en: 'The cars are expensive.', highlight: ['Los', 'coches', 'caros'] },
    ],
    pitfalls: ['Making the noun plural but leaving the adjective singular: "las casas blanca".'],
  },

  {
    id: 'g.possessives',
    kind: 'grammar',
    level: 'A1',
    topics: ['family', 'people'],
    title: 'Whose it is',
    short: 'Possessives agree with the thing owned, not with the owner.',
    requires: ['g.plurals'],
    summary: [
      {
        type: 'rule',
        label: 'The rule that trips everyone',
        text: 'mi, tu, su change for the number of the thing owned, never for who owns it. One brother is mi hermano; two are mis hermanos — even though "I" has not changed.',
      },
      {
        type: 'table',
        head: ['', 'one thing', 'several things'],
        rows: [
          ['my', 'mi', 'mis'],
          ['your', 'tu', 'tus'],
          ['his / her / their / your (formal)', 'su', 'sus'],
          ['our', 'nuestro / nuestra', 'nuestros / nuestras'],
          ['your (vosotros)', 'vuestro / vuestra', 'vuestros / vuestras'],
        ],
      },
      {
        type: 'warning',
        text: 'su is genuinely ambiguous — it can mean his, her, their or your. Spanish lets context decide, and adds de él / de ella only when it truly matters.',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'With body parts and close family, Spanish often prefers the plain article where English insists on a possessive.',
      },
      {
        type: 'examples',
        items: [
          { es: 'Me duele la cabeza.', en: 'My head hurts.', note: 'Literally "the head hurts to me".' },
          { es: 'Voy a lavarme las manos.', en: "I'm going to wash my hands." },
        ],
      },
    ],
    examples: [
      { es: 'Mi hermana vive en Sevilla.', en: 'My sister lives in Seville.', highlight: ['Mi'] },
      { es: 'Mis padres son de Bilbao.', en: 'My parents are from Bilbao.', highlight: ['Mis'] },
      { es: '¿Es vuestro coche?', en: 'Is it your car?', highlight: ['vuestro'] },
    ],
    pitfalls: [
      'Using mis because "I" feel plural — it is the number of the thing owned that counts.',
      'Reaching for su when talking to friends: with tú you need tu.',
    ],
  },

  {
    id: 'g.demonstratives',
    kind: 'grammar',
    level: 'A1',
    topics: ['shopping', 'describing'],
    title: 'This one, that one',
    short: 'Spanish has three distances where English has two.',
    requires: ['g.gender'],
    summary: [
      {
        type: 'text',
        text: 'English splits the world into "this" and "that". Spanish splits it three ways, by how far the thing is from each of you.',
      },
      {
        type: 'table',
        head: ['Distance', 'masculine', 'feminine', 'Rough English'],
        rows: [
          ['near me', 'este', 'esta', 'this'],
          ['near you', 'ese', 'esa', 'that'],
          ['far from both', 'aquel', 'aquella', 'that one over there'],
        ],
      },
      {
        type: 'tip',
        text: 'In a shop this is the whole conversation: ¿Este? — No, ese. Pointing plus the right word gets you what you want.',
      },
      {
        type: 'rule',
        label: 'The neuter one',
        text: 'esto, eso and aquello refer to a situation or something unidentified, and never change: ¿Qué es esto? Eso no me gusta.',
      },
    ],
    examples: [
      { es: 'Quiero este, por favor.', en: 'I want this one, please.', highlight: ['este'] },
      { es: 'Esa chica es mi hermana.', en: 'That girl is my sister.', highlight: ['Esa'] },
      { es: '¿Qué es esto?', en: 'What is this?', highlight: ['esto'] },
    ],
    pitfalls: ['Using este for something the other person is holding — that is ese.'],
  },

  {
    id: 'g.numbers-system',
    kind: 'grammar',
    level: 'A1',
    topics: ['numbers', 'shopping'],
    title: 'Building any number',
    short: 'Learn 1–15 and the tens; everything else is assembled.',
    summary: [
      {
        type: 'text',
        text: 'Only 0–15 have to be memorised as separate words. After that Spanish builds numbers from parts you already know.',
      },
      {
        type: 'table',
        head: ['Range', 'How it works', 'Example'],
        rows: [
          ['16–29', 'one word', 'dieciséis, veintitrés'],
          ['31–99', 'tens + y + unit', 'cuarenta y dos'],
          ['100', 'cien on its own', 'cien euros'],
          ['101–199', 'ciento + rest, no y', 'ciento veinte'],
        ],
      },
      {
        type: 'warning',
        text: 'There is no y between hundreds and tens. Ciento veinte, never "ciento y veinte" — the y only joins tens to units.',
      },
      {
        type: 'rule',
        label: 'uno loses its -o',
        text: 'Before a masculine noun uno becomes un: un café, veintiún años. Before a feminine noun it becomes una.',
      },
    ],
    examples: [
      { es: 'Tengo veintiún años.', en: "I'm twenty-one.", highlight: ['veintiún'] },
      { es: 'Son cuarenta y cinco euros.', en: "That's forty-five euros.", highlight: ['cuarenta y cinco'] },
      { es: 'El billete cuesta ciento diez euros.', en: 'The ticket costs a hundred and ten euros.' },
    ],
    pitfalls: [
      'Saying "un año" when you mean your age — age uses tener: tengo un año.',
      'Adding y after the hundreds.',
    ],
  },

  {
    id: 'g.dates',
    kind: 'grammar',
    level: 'A1',
    topics: ['time'],
    title: 'Days and dates',
    short: 'el lunes means "on Monday", and dates run day-month with de.',
    requires: ['g.articles'],
    summary: [
      {
        type: 'rule',
        label: 'No word for "on"',
        text: 'Spanish uses the article instead. Trabajo el lunes — I work on Monday. Los lunes with the plural means every Monday.',
      },
      {
        type: 'contrast',
        left: {
          title: 'el lunes',
          caption: 'This coming Monday',
          tone: 'listening',
          examples: [{ es: 'Tengo clase el lunes.', en: 'I have class on Monday.' }],
        },
        right: {
          title: 'los lunes',
          caption: 'Every Monday',
          tone: 'grammar',
          examples: [{ es: 'Los lunes voy al gimnasio.', en: 'On Mondays I go to the gym.' }],
        },
      },
      {
        type: 'rule',
        label: 'Dates',
        text: 'Number first, then de, then the month: el doce de marzo. Days and months are never capitalised.',
      },
      {
        type: 'tip',
        text: 'The first of the month is el uno de… in Spain; you will also hear el primero de… in Latin America.',
      },
    ],
    examples: [
      { es: 'Mi cumpleaños es el doce de marzo.', en: 'My birthday is the twelfth of March.', highlight: ['el doce de marzo'] },
      { es: 'Los viernes salgo con mis amigos.', en: 'On Fridays I go out with my friends.', highlight: ['Los viernes'] },
    ],
    pitfalls: [
      'Adding en before a day: "en lunes" is wrong — it is el lunes.',
      'Capitalising lunes or marzo.',
    ],
  },
];
