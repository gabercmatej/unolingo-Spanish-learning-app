import type { ConversationScene } from '@/content/types';

/**
 * Conversation practice for the units the curriculum expansion added.
 *
 * Same reason as `stories-everyday.ts`: twenty-one new units arrived with no
 * enrichment and conversation's reach across A1 fell from 29% of units to 19%.
 * The modality check measures reach rather than presence precisely so that a
 * stage cannot satisfy it with one token scene, and a stage of grammar drills
 * is exactly what it exists to catch.
 *
 * Each scene sits at the level of the unit it belongs to and reuses that unit's
 * vocabulary under pressure — the learner has to produce, in a conversation
 * that moves, the words they met as cards two lessons earlier.
 *
 * `options`, where used, always include a reply that is grammatical and
 * unnatural. Knowing the difference is the point.
 */
export const everydayConversations: ConversationScene[] = [
  {
    id: 'conv.medico',
    title: 'En el médico',
    icon: 'pulse-outline',
    setting: 'Centro de salud, sala de consulta. Llevas tres días sin encontrarte bien y por fin te toca.',
    level: 'A1',
    topics: ['health'],
    partner: { name: 'Dra. Nieto' },
    turns: [
      { speaker: 'partner', es: 'Buenos días, siéntese. ¿Qué le pasa?', en: 'Good morning, take a seat. What’s wrong?' },
      {
        speaker: 'you',
        instruction: 'Di que te duele la cabeza y que no te encuentras bien.',
        accepted: [
          'me duele la cabeza y no me encuentro bien',
          'no me encuentro bien, me duele la cabeza',
          'me duele mucho la cabeza',
          'me duele la cabeza',
        ],
        hints: ['me duele…', 'no me encuentro bien'],
        concepts: ['v.doler', 'v.cabeza', 'v.encontrar'],
        options: [
          { es: 'Me duele la cabeza y no me encuentro bien.', en: 'My head hurts and I don’t feel well.', natural: true },
          { es: 'Estoy doliendo la cabeza.', en: '(unnatural — doler does not work like that)', natural: false, note: 'Doler behaves like gustar: the body part is the subject. Me duele la cabeza.' },
          { es: 'Tengo dolor a la cabeza.', en: '(unnatural preposition)', natural: false, note: 'Dolor de cabeza, never dolor a la cabeza.' },
        ],
      },
      { speaker: 'partner', es: '¿Desde cuándo? ¿Y le duele algo más?', en: 'Since when? And does anything else hurt?' },
      {
        speaker: 'you',
        instruction: 'Di que desde el lunes, y que también te duele la garganta.',
        accepted: [
          'desde el lunes, y también me duele la garganta',
          'desde el lunes, también me duele la garganta',
          'desde el lunes y me duele la garganta',
        ],
        hints: ['desde el lunes', 'también me duele…'],
        concepts: ['v.doler', 'v.garganta'],
      },
      { speaker: 'partner', es: '¿Ha tenido fiebre?', en: 'Have you had a temperature?' },
      {
        speaker: 'you',
        instruction: 'Di que no, pero que duermes muy mal.',
        accepted: ['no, pero duermo muy mal', 'no, pero no duermo bien', 'no he tenido fiebre, pero duermo mal'],
        hints: ['duermo mal', 'no, pero…'],
        concepts: ['v.dormir'],
      },
      { speaker: 'partner', es: 'Nada grave. Descanse, beba agua y vuelva el viernes si sigue igual.', en: 'Nothing serious. Rest, drink water and come back on Friday if it’s the same.' },
    ],
  },
  {
    id: 'conv.casa',
    title: 'Enseñando el piso',
    icon: 'home-outline',
    setting: 'Acabas de mudarte y un amigo viene a verlo por primera vez.',
    level: 'A1',
    topics: ['home'],
    partner: { name: 'Nacho' },
    turns: [
      { speaker: 'partner', es: '¡Qué bien! ¿Y cuántas habitaciones tiene?', en: 'Nice! And how many rooms does it have?' },
      {
        speaker: 'you',
        instruction: 'Di que tiene dos habitaciones, una cocina y un baño.',
        accepted: [
          'tiene dos habitaciones, una cocina y un baño',
          'dos habitaciones, una cocina y un baño',
          'tiene dos habitaciones, cocina y baño',
        ],
        hints: ['la habitación', 'la cocina', 'el baño'],
        concepts: ['v.habitacion', 'v.cocina', 'v.bano'],
      },
      { speaker: 'partner', es: '¿Y el salón dónde está?', en: 'And where’s the living room?' },
      {
        speaker: 'you',
        instruction: 'Di que el salón está abajo, al lado de la cocina.',
        accepted: [
          'el salón está abajo, al lado de la cocina',
          'está abajo, al lado de la cocina',
          'el salón está abajo al lado de la cocina',
        ],
        hints: ['abajo', 'al lado de'],
        concepts: ['v.salon', 'v.abajo', 'v.cocina'],
        options: [
          { es: 'El salón está abajo, al lado de la cocina.', en: 'The living room is downstairs, next to the kitchen.', natural: true },
          { es: 'El salón está debajo la cocina.', en: '(missing preposition)', natural: false, note: 'Debajo always takes de: debajo de la cocina.' },
          { es: 'El salón es abajo.', en: '(wrong verb)', natural: false, note: 'Location takes estar, not ser.' },
        ],
      },
      { speaker: 'partner', es: 'Oye, ¿y tienes nevera ya?', en: 'Hey, have you got a fridge yet?' },
      {
        speaker: 'you',
        instruction: 'Di que sí, pero que necesitas una mesa y dos sillas.',
        accepted: [
          'sí, pero necesito una mesa y dos sillas',
          'sí, pero necesito una mesa y dos sillas',
          'tengo nevera, pero necesito una mesa y dos sillas',
        ],
        hints: ['necesito…', 'la mesa', 'la silla'],
        concepts: ['v.nevera', 'v.necesitar', 'v.silla'],
      },
      { speaker: 'partner', es: 'Yo tengo dos sillas que no uso. Te las traigo el sábado.', en: 'I’ve got two chairs I don’t use. I’ll bring them over on Saturday.' },
    ],
  },
  {
    id: 'conv.correos',
    title: 'En la oficina de correos',
    icon: 'navigate-outline',
    setting: 'Tienes que recoger un paquete y sólo llevas el móvil. La cola es larga.',
    level: 'A2',
    topics: ['city', 'shopping'],
    partner: { name: 'Empleado' },
    turns: [
      { speaker: 'partner', es: 'Buenas. ¿Qué necesita?', en: 'Hello. What do you need?' },
      {
        speaker: 'you',
        instruction: 'Di que vienes a recoger un paquete.',
        accepted: ['vengo a recoger un paquete', 'vengo a por un paquete', 'quería recoger un paquete'],
        hints: ['vengo a…', 'recoger'],
        concepts: ['v.oficina-correos'],
      },
      { speaker: 'partner', es: '¿Me deja el aviso y un documento, por favor?', en: 'Can I have the slip and some ID, please?' },
      {
        speaker: 'you',
        instruction: 'Di que no tienes el aviso, pero sí el pasaporte.',
        accepted: [
          'no tengo el aviso, pero tengo el pasaporte',
          'el aviso no lo tengo, pero sí el pasaporte',
          'no tengo el aviso, pero sí el pasaporte',
        ],
        hints: ['no tengo…', 'el pasaporte'],
        concepts: ['v.pasaporte'],
      },
      { speaker: 'partner', es: 'Con el pasaporte vale. ¿Paga los gastos con tarjeta o en efectivo?', en: 'The passport is fine. Are you paying the charges by card or cash?' },
      {
        speaker: 'you',
        instruction: 'Pregunta si se puede pagar con tarjeta.',
        accepted: ['¿se puede pagar con tarjeta?', 'con tarjeta, ¿se puede?', '¿puedo pagar con tarjeta?'],
        hints: ['¿se puede pagar con tarjeta?'],
        concepts: ['p.se-puede-pagar-tarjeta', 'v.tarjeta'],
      },
      { speaker: 'partner', es: 'Claro. Firme aquí y ya está.', en: 'Of course. Sign here and that’s it.' },
    ],
  },
  {
    id: 'conv.plan-fin-de-semana',
    title: 'Cuadrar el fin de semana',
    icon: 'calendar-outline',
    setting: 'Dos amigos intentando encontrar un hueco. Ninguno de los dos quiere ceder primero.',
    level: 'B1',
    topics: ['plans', 'social'],
    partner: { name: 'Bea' },
    turns: [
      { speaker: 'partner', es: '¿Quedamos el sábado o lo dejamos para el domingo?', en: 'Shall we meet on Saturday or leave it for Sunday?' },
      {
        speaker: 'you',
        instruction: 'Di que depende del tiempo que haga.',
        accepted: ['depende del tiempo que haga', 'depende del tiempo', 'pues depende del tiempo que haga'],
        hints: ['depende de…'],
        concepts: ['p.depende', 'v.depender-de'],
      },
      { speaker: 'partner', es: 'Dicen que el sábado llueve toda la tarde.', en: 'They say it’ll rain all Saturday afternoon.' },
      {
        speaker: 'you',
        instruction: 'Propón el domingo, y di que en cuanto llegues le escribes.',
        accepted: [
          'mejor el domingo, y en cuanto llegue te escribo',
          'entonces el domingo, en cuanto llegue te escribo',
          'pues el domingo, y en cuanto llegue te escribo',
        ],
        hints: ['en cuanto + subjuntivo', 'mejor el domingo'],
        concepts: ['p.en-cuanto', 'v.llegar'],
        options: [
          { es: 'Mejor el domingo, y en cuanto llegue te escribo.', en: 'Better on Sunday, and I’ll text you as soon as I get there.', natural: true },
          { es: 'Mejor el domingo, y en cuanto llego te escribo.', en: '(indicative after en cuanto)', natural: false, note: 'En cuanto takes the subjunctive for something that has not happened yet: en cuanto llegue.' },
          { es: 'Mejor el domingo, y cuando llegaré te escribo.', en: '(future after cuando)', natural: false, note: 'Spanish never puts the future after cuando — it uses the subjunctive.' },
        ],
      },
      { speaker: 'partner', es: 'Vale. ¿Y hasta qué hora te viene bien?', en: 'Fine. And what time works for you?' },
      {
        speaker: 'you',
        instruction: 'Di que puedes hasta que cierren el parque.',
        accepted: ['puedo hasta que cierren el parque', 'hasta que cierren el parque', 'me viene bien hasta que cierren el parque'],
        hints: ['hasta que + subjuntivo', 'el parque'],
        concepts: ['p.hasta-que', 'v.parque', 'v.cerrar'],
      },
      { speaker: 'partner', es: 'Hecho. Nos vemos el domingo entonces.', en: 'Done. See you Sunday then.' },
    ],
  },
  {
    id: 'conv.reunion-plazo',
    title: 'Un plazo que no cuadra',
    icon: 'briefcase-outline',
    setting: 'Reunión corta. Te han puesto una fecha que no es realista y hay que decirlo sin quemar la relación.',
    level: 'B2',
    topics: ['work', 'opinions'],
    partner: { name: 'Álvaro' },
    turns: [
      { speaker: 'partner', es: 'Damos por hecho que lo tenéis para el día quince, ¿no?', en: 'We’re taking it for granted you’ll have it by the fifteenth, right?' },
      {
        speaker: 'you',
        instruction: 'Di que, que tú sepas, nadie ha confirmado esa fecha.',
        accepted: [
          'que yo sepa, nadie ha confirmado esa fecha',
          'que yo sepa nadie ha confirmado esa fecha',
          'que yo sepa, esa fecha no la ha confirmado nadie',
        ],
        hints: ['que yo sepa', 'nadie ha confirmado'],
        concepts: ['p.que-yo-sepa', 'p.dar-por-hecho'],
      },
      { speaker: 'partner', es: 'Bueno, es la que veníamos manejando. ¿Supone un problema?', en: 'Well, it’s the one we’ve been working with. Is that a problem?' },
      {
        speaker: 'you',
        instruction: 'Di que supondría dejar fuera las pruebas, y que la desventaja es grande.',
        accepted: [
          'supondría dejar fuera las pruebas, y la desventaja es grande',
          'supondría dejar las pruebas fuera, y la desventaja es grande',
          'eso supondría dejar fuera las pruebas y la desventaja es grande',
        ],
        hints: ['supondría', 'la desventaja'],
        concepts: ['v.suponer', 'v.desventaja'],
      },
      { speaker: 'partner', es: 'Entonces, ¿qué propones?', en: 'So what are you proposing?' },
      {
        speaker: 'you',
        instruction: 'Propón establecer el plazo el día veintidós y mantener el resto igual.',
        accepted: [
          'establecer el plazo el veintidós y mantener el resto igual',
          'propongo establecer el plazo el veintidós y mantener el resto igual',
          'establecemos el plazo el veintidós y mantenemos el resto igual',
        ],
        hints: ['establecer el plazo', 'mantener el resto'],
        concepts: ['v.establecer', 'v.mantener'],
      },
      { speaker: 'partner', es: 'Me parece razonable. Lo llevo yo a dirección.', en: 'That seems reasonable. I’ll take it to management.' },
    ],
  },
];
