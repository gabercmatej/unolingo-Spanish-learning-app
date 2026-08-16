import type { CultureNote } from '@/content/types';

/**
 * Short cultural asides dropped between exercises. Kept to a few sentences —
 * they exist to make Spain feel present, not to become a reading task.
 */
export const cultureNotes: CultureNote[] = [
  {
    id: 'c.sobremesa',
    title: 'La sobremesa',
    icon: 'cafe-outline',
    body: 'The time you stay at the table after eating, talking, with the plates still there. It has its own word because it is its own activity — and cutting it short to rush off is mildly rude. A Sunday sobremesa can outlast the meal.',
    level: 'A2',
    topics: ['food', 'social'],
  },
  {
    id: 'c.meal-times',
    title: 'Everything is later',
    icon: 'time-outline',
    body: 'Lunch is around 2–3pm and is the big meal of the day. Dinner rarely starts before 9pm and often nearer 10. If someone invites you to dinner at eight, they are probably being considerate about your foreign habits.',
    level: 'A1',
    topics: ['food', 'time'],
  },
  {
    id: 'c.cana',
    title: 'The caña',
    icon: 'beer-outline',
    body: 'A caña is a small draught beer, about 200ml, drunk cold and fast so it never goes warm. Ordering a pint gets you a strange look in most neighbourhood bars. "¿Tomamos una caña?" rarely means only one.',
    level: 'A2',
    topics: ['cafe', 'social'],
  },
  {
    id: 'c.vosotros',
    title: 'Why vosotros matters',
    icon: 'people-outline',
    body: 'Most courses skip vosotros because Latin America does not use it. In Spain you will hear it every single day — with friends, in shops, in adverts. Skipping it means half of what you hear sounds like an unfamiliar tense.',
    level: 'A0',
    topics: ['people'],
  },
  {
    id: 'c.tuteo',
    title: 'Spain tutea',
    icon: 'person-outline',
    body: 'Spaniards use tú far more readily than most Spanish-speaking countries. Waiters, shop assistants and people your age will almost always tú you. Reaching for usted with someone in their thirties can create distance you did not intend.',
    level: 'A2',
    topics: ['people', 'social'],
  },
  {
    id: 'c.two-surnames',
    title: 'Two surnames',
    icon: 'person-outline',
    body: 'Everyone in Spain carries two surnames: the father’s first, then the mother’s. Nobody changes their name on marrying. If a form asks for "apellidos" in the plural, that is why.',
    level: 'A2',
    topics: ['introductions', 'family'],
  },
  {
    id: 'c.dos-besos',
    title: 'Dos besos',
    icon: 'happy-outline',
    body: 'Greeting with two kisses — left cheek first — is standard between women, and between a woman and a man, in social settings. Men usually shake hands or hug. At work, a handshake is safe.',
    level: 'A1',
    topics: ['greetings', 'social'],
  },
  {
    id: 'c.menu-del-dia',
    title: 'El menú del día',
    icon: 'restaurant-outline',
    body: 'A weekday lunch institution born of a 1960s law: a starter, a main, bread, a drink and a dessert or coffee for one fixed price. It is how most of working Spain eats lunch, and it is usually excellent value.',
    level: 'A2',
    topics: ['restaurant', 'food'],
  },
  {
    id: 'c.quedar',
    title: 'Quedar is a whole social system',
    icon: 'calendar-outline',
    body: 'Quedar is not just "to meet". It is the act of arranging: hemos quedado means the plan exists. Spaniards quedan constantly and confirm late — a plan for Saturday may still be shapeless on Friday night.',
    level: 'A2',
    topics: ['plans', 'social'],
  },
  {
    id: 'c.puente',
    title: 'Hacer puente',
    icon: 'calendar-outline',
    body: 'When a public holiday falls on a Tuesday or Thursday, the country "bridges" the gap and takes the Monday or Friday too. Whole cities empty out. Check the calendar before assuming anything is open.',
    level: 'B1',
    topics: ['time', 'social'],
  },
  {
    id: 'c.coger',
    title: 'The coger problem',
    icon: 'subway-outline',
    body: 'In Spain you coger the bus, coger a taxi, coger a cold. In Argentina and Mexico the same verb is crude slang, which is why Latin American courses avoid it. Learning es-ES means using it without hesitation.',
    level: 'A2',
    topics: ['transport'],
  },
  {
    id: 'c.ceceo',
    title: 'That "th" sound',
    icon: 'mic-outline',
    body: 'In most of Spain, c before e/i and the letter z are pronounced like the "th" in "think". Gracias sounds like "grathias", cerveza like "thervetha". It is not a lisp — it is a distinct sound Latin American Spanish merged with s.',
    level: 'A1',
    topics: ['greetings'],
  },
];
