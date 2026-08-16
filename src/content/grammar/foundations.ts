import type { GrammarConcept } from '@/content/types';

/**
 * A0–A1 grammar. Each card is short enough to read in under a minute; anything
 * longer lives in `deepDive` behind "Explain more".
 */
export const foundationsGrammar: GrammarConcept[] = [
  {
    id: 'g.gender',
    kind: 'grammar',
    level: 'A0',
    topics: ['people', 'describing'],
    title: 'Every noun has a gender',
    short: 'Nouns are masculine or feminine, and the article has to match.',
    summary: [
      {
        type: 'text',
        text: 'Spanish nouns are either masculine or feminine. It is grammatical, not about meaning — a table is feminine and a book is masculine for no particular reason.',
      },
      {
        type: 'contrast',
        left: {
          title: 'el — masculine',
          caption: 'Usually ends in -o',
          tone: 'listening',
          examples: [
            { es: 'el libro', en: 'the book' },
            { es: 'el coche', en: 'the car' },
            { es: 'el piso', en: 'the flat' },
          ],
        },
        right: {
          title: 'la — feminine',
          caption: 'Usually ends in -a',
          tone: 'grammar',
          examples: [
            { es: 'la casa', en: 'the house' },
            { es: 'la calle', en: 'the street' },
            { es: 'la mesa', en: 'the table' },
          ],
        },
      },
      {
        type: 'tip',
        text: 'Learn the article with the noun — store "la calle", never bare "calle". It saves years of guessing.',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'The -o / -a rule covers most nouns but there are groups worth knowing.',
      },
      {
        type: 'table',
        head: ['Ending', 'Gender', 'Example'],
        rows: [
          ['-ción, -sión', 'feminine', 'la estación'],
          ['-dad, -tad', 'feminine', 'la ciudad'],
          ['-ma (Greek origin)', 'masculine', 'el problema'],
          ['-e', 'either — learn it', 'el coche, la calle'],
        ],
      },
      {
        type: 'warning',
        text: 'A few feminine nouns take el in the singular to stop two stressed a-sounds colliding: el agua, el aula. They are still feminine — el agua fría.',
      },
    ],
    examples: [
      { es: 'El piso es pequeño.', en: 'The flat is small.', highlight: ['El', 'pequeño'] },
      { es: 'La casa es grande.', en: 'The house is big.', highlight: ['La'] },
    ],
    pitfalls: ['Saying "la problema" — problema is masculine.'],
  },

  {
    id: 'g.adjective-agreement',
    kind: 'grammar',
    level: 'A1',
    topics: ['describing'],
    title: 'Adjectives agree',
    short: 'Adjectives copy the gender and number of the noun, and usually follow it.',
    summary: [
      {
        type: 'rule',
        label: 'Word order',
        text: 'In Spanish the adjective normally comes after the noun: un coche rojo, not un rojo coche.',
      },
      {
        type: 'table',
        head: ['', 'Masculine', 'Feminine'],
        rows: [
          ['Singular', 'cansado', 'cansada'],
          ['Plural', 'cansados', 'cansadas'],
        ],
      },
      {
        type: 'text',
        text: 'Adjectives ending in -e or a consonant do not change for gender — only for number: triste → tristes, difícil → difíciles.',
      },
      {
        type: 'examples',
        items: [
          { es: 'Mi hermana está cansada.', en: 'My sister is tired.', highlight: ['cansada'] },
          { es: 'Los libros son difíciles.', en: 'The books are difficult.', highlight: ['difíciles'] },
          { es: 'Es una ciudad bonita.', en: 'It’s a pretty city.', highlight: ['bonita'] },
        ],
      },
    ],
    examples: [
      { es: 'Las tapas están buenas.', en: 'The tapas are good.', highlight: ['buenas'] },
    ],
    pitfalls: ['Leaving the adjective in the masculine when describing yourself or a feminine noun.'],
    requires: ['g.gender'],
  },

  {
    id: 'g.present-regular',
    kind: 'grammar',
    level: 'A0',
    topics: ['daily-routine'],
    title: 'The present tense',
    short: 'Drop -ar / -er / -ir and add the ending that says who.',
    summary: [
      {
        type: 'text',
        text: 'The verb ending carries the subject, which is why Spanish drops "yo" and "tú" most of the time.',
      },
      {
        type: 'table',
        head: ['', 'hablar', 'comer', 'vivir'],
        rows: [
          ['yo', 'hablo', 'como', 'vivo'],
          ['tú', 'hablas', 'comes', 'vives'],
          ['él / ella', 'habla', 'come', 'vive'],
          ['nosotros', 'hablamos', 'comemos', 'vivimos'],
          ['vosotros', 'habláis', 'coméis', 'vivís'],
          ['ellos', 'hablan', 'comen', 'viven'],
        ],
      },
      {
        type: 'tip',
        text: 'The vosotros forms carry an accent — habláis, coméis, vivís. In Spain you will use them constantly.',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: '-er and -ir verbs only differ in two places: nosotros (comemos / vivimos) and vosotros (coméis / vivís). Everything else is identical.',
      },
      {
        type: 'text',
        text: 'One Spanish present covers three English ones. "Hablo español" can be I speak, I am speaking, or I do speak, depending on context.',
      },
    ],
    examples: [
      { es: 'Hablo un poco de español.', en: 'I speak a bit of Spanish.', highlight: ['Hablo'] },
      { es: '¿Vivís en Madrid?', en: 'Do you (all) live in Madrid?', highlight: ['Vivís'] },
      { es: 'Comemos sobre las dos.', en: 'We have lunch around two.', highlight: ['Comemos'] },
    ],
    pitfalls: ['Adding "yo" to every sentence — it sounds emphatic, like "*I* speak Spanish".'],
  },

  {
    id: 'g.ser-estar',
    kind: 'grammar',
    level: 'A1',
    topics: ['describing', 'feelings'],
    title: 'Ser vs estar',
    short: 'Ser is what something is; estar is how or where it is.',
    summary: [
      {
        type: 'contrast',
        left: {
          title: 'SER',
          caption: 'Identity, origin, what it fundamentally is',
          tone: 'grammar',
          examples: [
            { es: 'Soy esloveno.', en: 'I’m Slovenian.' },
            { es: 'Madrid es grande.', en: 'Madrid is big.' },
            { es: 'Es mi hermana.', en: 'She’s my sister.' },
          ],
        },
        right: {
          title: 'ESTAR',
          caption: 'State right now, and location',
          tone: 'listening',
          examples: [
            { es: 'Estoy cansado.', en: 'I’m tired.' },
            { es: 'Madrid está en España.', en: 'Madrid is in Spain.' },
            { es: 'La cena está lista.', en: 'Dinner is ready.' },
          ],
        },
      },
      {
        type: 'rule',
        label: 'The shortcut that actually works',
        text: 'If you could add "right now" and it still makes sense, use estar. Otherwise use ser.',
        tone: 'success',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'Some adjectives change meaning depending on which verb you pick. This is where ser/estar stops being a chore and starts being useful.',
      },
      {
        type: 'table',
        head: ['Adjective', 'with SER', 'with ESTAR'],
        rows: [
          ['aburrido', 'boring', 'bored'],
          ['listo', 'clever', 'ready'],
          ['bueno', 'good (a good person)', 'tasty / attractive'],
          ['rico', 'rich', 'delicious'],
        ],
      },
      {
        type: 'warning',
        text: 'Location of an event is the exception: it takes ser. "La fiesta es en mi casa" — but "Mi casa está en Valencia".',
      },
    ],
    examples: [
      { es: 'Estoy cansado, pero soy feliz.', en: 'I’m tired, but I’m a happy person.' },
      { es: '¿Dónde está el baño?', en: 'Where’s the toilet?', highlight: ['está'] },
    ],
    pitfalls: [
      'Yo soy cansado — this says you are a tiring person. You want estoy cansado.',
      'Using ser for location: "Madrid es en España" should be está.',
    ],
    requires: ['g.present-regular'],
  },

  {
    id: 'g.questions',
    kind: 'grammar',
    level: 'A0',
    topics: ['greetings'],
    title: 'Asking questions',
    short: 'No extra "do" verb — just intonation, and two question marks in writing.',
    summary: [
      {
        type: 'rule',
        label: 'No auxiliary',
        text: 'English needs "do": *Do* you live in Madrid? Spanish does not. ¿Vives en Madrid?',
      },
      {
        type: 'text',
        text: 'Written Spanish opens a question with an upside-down ¿ so you know a question is coming before you read it aloud.',
      },
      {
        type: 'examples',
        items: [
          { es: '¿Hablas español?', en: 'Do you speak Spanish?' },
          { es: '¿Dónde vives?', en: 'Where do you live?' },
          { es: '¿Qué haces mañana?', en: 'What are you doing tomorrow?' },
        ],
      },
      {
        type: 'tip',
        text: 'Question words carry an accent: qué, dónde, cómo, cuándo, quién, cuánto.',
      },
    ],
    examples: [{ es: '¿Cómo te llamas?', en: 'What’s your name?' }],
    pitfalls: ['Translating "do" literally — there is no Spanish word for it here.'],
  },

  {
    id: 'g.negation',
    kind: 'grammar',
    level: 'A0',
    topics: ['opinions'],
    title: 'Saying no',
    short: 'Put no directly before the verb. Double negatives are correct.',
    summary: [
      {
        type: 'rule',
        label: 'Position',
        text: 'no goes immediately before the verb: No hablo francés.',
      },
      {
        type: 'text',
        text: 'When a negative word comes after the verb, Spanish keeps the no as well. Two negatives do not cancel out.',
      },
      {
        type: 'examples',
        items: [
          { es: 'No tengo coche.', en: 'I don’t have a car.' },
          { es: 'No me gusta nada.', en: 'I don’t like it at all.', highlight: ['No', 'nada'] },
          { es: 'No conozco a nadie aquí.', en: 'I don’t know anyone here.' },
        ],
      },
    ],
    examples: [{ es: 'Hoy no trabajo.', en: 'I’m not working today.' }],
    pitfalls: ['Dropping the first no: "Me gusta nada" is not Spanish.'],
  },

  {
    id: 'g.hay-estar',
    kind: 'grammar',
    level: 'A1',
    topics: ['city', 'directions'],
    title: 'Hay vs está',
    short: 'Hay introduces something new; está locates something already known.',
    summary: [
      {
        type: 'contrast',
        left: {
          title: 'HAY',
          caption: 'There is / there are — existence',
          tone: 'grammar',
          examples: [
            { es: 'Hay un banco en la plaza.', en: 'There’s a bank in the square.' },
            { es: '¿Hay wifi aquí?', en: 'Is there wifi here?' },
          ],
        },
        right: {
          title: 'ESTÁ',
          caption: 'Where a specific thing is',
          tone: 'listening',
          examples: [
            { es: 'El banco está en la plaza.', en: 'The bank is in the square.' },
            { es: '¿Dónde está el metro?', en: 'Where’s the metro?' },
          ],
        },
      },
      {
        type: 'rule',
        label: 'The giveaway',
        text: 'hay goes with un / una / dos / algunos. está goes with el / la / mi / este.',
        tone: 'success',
      },
      {
        type: 'tip',
        text: 'hay never changes: hay un bar, hay tres bares. There is no "han" here.',
      },
    ],
    examples: [
      { es: 'Hay una farmacia al lado del metro.', en: 'There’s a pharmacy next to the metro.' },
      { es: 'La farmacia está al lado del metro.', en: 'The pharmacy is next to the metro.' },
    ],
    pitfalls: ['"Hay el banco" — if you name a specific thing, you need está.'],
    requires: ['g.ser-estar'],
  },

  {
    id: 'g.tener-expressions',
    kind: 'grammar',
    level: 'A1',
    topics: ['feelings', 'introductions'],
    title: 'Things you have, not things you are',
    short: 'Age, hunger, cold and hurry are things you have, not things you are.',
    summary: [
      {
        type: 'text',
        text: 'A whole family of states uses tener where English uses "to be". Translating these literally is the single most recognisable learner mistake.',
      },
      {
        type: 'table',
        head: ['Spanish', 'English'],
        rows: [
          ['tengo 21 años', 'I’m 21'],
          ['tengo hambre', 'I’m hungry'],
          ['tengo sed', 'I’m thirsty'],
          ['tengo frío / calor', 'I’m cold / hot'],
          ['tengo sueño', 'I’m sleepy'],
          ['tengo prisa', 'I’m in a hurry'],
          ['tengo miedo', 'I’m scared'],
        ],
      },
      {
        type: 'rule',
        label: 'tener que + infinitivo',
        text: 'Obligation: Tengo que estudiar — I have to study.',
      },
    ],
    examples: [
      { es: 'Tengo hambre, ¿comemos algo?', en: 'I’m hungry, shall we eat something?' },
      { es: 'Tengo que coger el metro.', en: 'I have to take the metro.' },
    ],
    pitfalls: ['"Soy 21 años" and "estoy hambre" — both need tengo.'],
  },

  {
    id: 'g.gustar',
    kind: 'grammar',
    level: 'A1',
    topics: ['opinions', 'hobbies'],
    title: 'Gustar works backwards',
    short: 'The thing you like is the subject: "coffee is pleasing to me".',
    summary: [
      {
        type: 'text',
        text: 'Gustar does not mean "to like". It means "to be pleasing". So the thing being liked drives the verb, and you appear as me / te / le.',
      },
      {
        type: 'table',
        head: ['', 'singular thing', 'plural thing'],
        rows: [
          ['me', 'me gusta el café', 'me gustan los perros'],
          ['te', 'te gusta', 'te gustan'],
          ['le', 'le gusta', 'le gustan'],
          ['nos', 'nos gusta', 'nos gustan'],
          ['os', 'os gusta', 'os gustan'],
          ['les', 'les gusta', 'les gustan'],
        ],
      },
      {
        type: 'rule',
        label: 'With a verb, always singular',
        text: 'Me gusta cocinar. Me gusta leer y viajar. Verbs never trigger gustan.',
        tone: 'success',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'A family of verbs behaves the same way — learn the pattern once and you get all of them.',
      },
      {
        type: 'table',
        head: ['Verb', 'Meaning'],
        rows: [
          ['encantar', 'to love'],
          ['apetecer', 'to fancy / feel like'],
          ['interesar', 'to interest'],
          ['doler', 'to hurt'],
          ['molar', 'to be cool (colloquial, Spain)'],
        ],
      },
      {
        type: 'text',
        text: 'To clarify or emphasise who, add a mí / a ti / a Marta: A mí me gusta, pero a él no.',
      },
    ],
    examples: [
      { es: 'Me gustan las tapas.', en: 'I like tapas.', highlight: ['gustan'] },
      { es: 'Me apetece un café.', en: 'I fancy a coffee.' },
      { es: 'A mí no me gusta nada el fútbol.', en: 'I don’t like football at all.' },
    ],
    pitfalls: [
      '"Yo gusto el café" — that says *you* are pleasing.',
      'Forgetting to make it plural: "me gusta los perros" should be gustan.',
    ],
  },

  {
    id: 'g.ir-a-infinitive',
    kind: 'grammar',
    level: 'A1',
    topics: ['plans', 'time'],
    title: 'Talking about the future with ir a',
    short: 'voy a + infinitive — how people actually express the future in Spain.',
    summary: [
      {
        type: 'rule',
        label: 'The formula',
        text: 'ir (conjugated) + a + infinitive. Voy a estudiar. Vamos a comer.',
      },
      {
        type: 'table',
        head: ['', 'ir', 'example'],
        rows: [
          ['yo', 'voy', 'voy a salir'],
          ['tú', 'vas', 'vas a ver'],
          ['él / ella', 'va', 'va a llegar tarde'],
          ['nosotros', 'vamos', 'vamos a quedar'],
          ['vosotros', 'vais', 'vais a venir'],
          ['ellos', 'van', 'van a cenar'],
        ],
      },
      {
        type: 'tip',
        text: 'The present tense also does future work when there is a time marker: Mañana quedo con Marta.',
      },
    ],
    examples: [
      { es: 'Voy a estudiar por la mañana.', en: 'I’m going to study in the morning.' },
      { es: '¿Vamos a tomar algo luego?', en: 'Shall we grab a drink later?' },
    ],
    pitfalls: ['Dropping the a: "voy estudiar" is wrong.'],
    requires: ['g.present-regular'],
  },
];
