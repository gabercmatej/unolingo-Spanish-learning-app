import type { GrammarConcept } from '@/content/types';

/**
 * C2 is about control, not difficulty. Every card here asks the same question
 * in a different form: of several correct options, which one does the job?
 *
 * Nothing in this file is a rare structure. They are all things a fluent
 * speaker does without noticing and an advanced learner still does bluntly.
 */
export const c2CoreGrammar: GrammarConcept[] = [
  {
    id: 'g.precision',
    kind: 'grammar',
    level: 'C2',
    topics: ['opinions', 'work'],
    title: 'La palabra exacta',
    short: 'Cuatro verbos correctos, cuatro grados de compromiso distintos.',
    summary: [
      {
        type: 'text',
        text: 'A partir de C1 el error deja de ser gramatical: la frase está bien construida pero la palabra elegida dice algo que no querías decir. Aquí lo que cambia es la connotación, no el significado.',
      },
      {
        type: 'table',
        head: ['Verbo', 'Lo que implica', 'Ejemplo'],
        rows: [
          ['decir', 'neutro', 'Dijo que no vendría.'],
          ['afirmar', 'lo sostiene con seguridad', 'Afirmó que era falso.'],
          ['sostener', 'lo mantiene pese a la duda ajena', 'Sostiene que él no estaba.'],
          ['alegar', 'lo usa como excusa; suena a poco creíble', 'Alegó problemas familiares.'],
        ],
      },
      {
        type: 'contrast',
        left: {
          title: 'Un problema',
          caption: 'Serio, sin fecha de caducidad',
          tone: 'grammar',
          examples: [{ es: 'Tenemos un problema con el proveedor.', en: 'We have a problem with the supplier.' }],
        },
        right: {
          title: 'Un contratiempo',
          caption: 'Molesto pero pasajero — suaviza a propósito',
          tone: 'listening',
          examples: [{ es: 'Ha habido un pequeño contratiempo.', en: 'There’s been a slight hitch.' }],
        },
      },
      {
        type: 'tip',
        text: 'Elegir la palabra más suave no es imprecisión: es una decisión retórica. Contratiempo en vez de problema le dice a tu interlocutor cómo quieres que reaccione.',
      },
    ],
    deepDive: [
      {
        type: 'text',
        text: 'Lo mismo ocurre con los adjetivos de enfado, ordenados de menor a mayor intensidad.',
      },
      {
        type: 'examples',
        items: [
          { es: 'molesto', en: 'annoyed', note: 'Leve, casi educado.' },
          { es: 'enfadado', en: 'angry', note: 'El término normal.' },
          { es: 'indignado', en: 'outraged', note: 'Enfado con causa moral.' },
          { es: 'airado', en: 'furious', note: 'Literario; en conversación suena exagerado.' },
        ],
      },
    ],
    examples: [
      { es: 'No lo niega: alega que no le avisaron.', en: 'He doesn’t deny it: he claims nobody told him.', highlight: ['alega'] },
      { es: 'Más que enfadada, estaba decepcionada.', en: 'More than angry, she was disappointed.', highlight: ['Más que'] },
    ],
    pitfalls: ['Usar siempre decir y problema: es correcto, pero deja toda la carga en el tono.'],
  },

  {
    id: 'g.naturalness',
    kind: 'grammar',
    level: 'C2',
    topics: ['opinions', 'describing'],
    title: 'Correcto pero raro',
    short: 'Frases impecables que ningún nativo diría, y por qué.',
    summary: [
      {
        type: 'text',
        text: 'A este nivel casi nadie corrige tu gramática. Lo que delata es el calco: la estructura inglesa vestida de español.',
      },
      {
        type: 'table',
        head: ['Se oye a menudo', 'Se dice', 'Qué falla'],
        rows: [
          ['Estoy buscando para un piso', 'Busco piso', 'buscar no lleva preposición'],
          ['Tomar una decisión rápida', 'Decidir rápido', 'el calco alarga sin añadir'],
          ['Es muy diferente de lo que esperaba', 'No es lo que esperaba', 'traducción literal, no error'],
          ['Tengo 30 años viejo', 'Tengo 30 años', 'la edad no lleva adjetivo'],
          ['Voy a mi casa', 'Me voy a casa', 'con posesivo suena a dirección postal'],
        ],
      },
      {
        type: 'rule',
        label: 'El orden dice mucho',
        text: 'El español coloca al final lo importante. Vino Marta responde a ¿quién vino?; Marta vino responde a ¿y Marta? Cambiar el orden cambia la pregunta que estás contestando.',
      },
      {
        type: 'warning',
        text: 'El posesivo se usa mucho menos que en inglés. Me duele la cabeza, me he dejado el móvil, voy a casa — el artículo basta cuando la pertenencia es obvia.',
      },
    ],
    examples: [
      { es: '¿Quién ha traído esto? — Lo ha traído Ana.', en: 'Who brought this? — Ana did.', highlight: ['Lo ha traído Ana'], note: 'La información nueva va al final.' },
      { es: 'Me he dejado las llaves dentro.', en: 'I’ve left my keys inside.', highlight: ['las llaves'] },
    ],
    pitfalls: ['Traducir la estructura en lugar de la idea.', 'Abusar del posesivo.'],
  },

  {
    id: 'g.emphasis',
    kind: 'grammar',
    level: 'C2',
    topics: ['opinions', 'storytelling'],
    title: 'Poner el foco donde quieres',
    short: 'Perífrasis de relativo, dislocación y repetición para enfatizar.',
    requires: ['g.lo-nominal'],
    summary: [
      {
        type: 'text',
        text: 'El español no sube la voz para enfatizar: reordena la frase. Estas son las tres formas más rentables.',
      },
      {
        type: 'table',
        head: ['Recurso', 'Neutro', 'Enfatizado'],
        rows: [
          ['Perífrasis', 'Quiero descansar.', 'Lo que quiero es descansar.'],
          ['Foco temporal', 'Me di cuenta entonces.', 'Fue entonces cuando me di cuenta.'],
          ['Dislocación', 'No he visto esa película.', 'Esa película no la he visto.'],
        ],
      },
      {
        type: 'rule',
        label: 'La dislocación pide pronombre',
        text: 'Si adelantas el objeto, tienes que repetirlo con un pronombre: El informe lo mando mañana. Sin el lo la frase suena incompleta.',
      },
      {
        type: 'tip',
        text: 'Sí que es el subrayado del español hablado: Sí que me acuerdo. No niega nada — refuerza contra una duda implícita.',
      },
    ],
    examples: [
      { es: 'Lo que no soporto es que me mientan.', en: 'What I can’t stand is being lied to.', highlight: ['Lo que no soporto es'] },
      { es: 'Eso ya lo hablamos ayer.', en: 'We already discussed that yesterday.', highlight: ['lo'] },
      { es: 'Fue ahí cuando decidí irme.', en: 'That was when I decided to leave.', highlight: ['Fue ahí cuando'] },
    ],
    pitfalls: ['Adelantar el objeto y olvidar el pronombre de repetición.'],
  },

  {
    id: 'g.audience',
    kind: 'grammar',
    level: 'C2',
    topics: ['work', 'social'],
    title: 'El mismo mensaje, otro público',
    short: 'Una sola noticia dicha a un amigo, a un cliente y a un tribunal.',
    requires: ['g.register'],
    summary: [
      {
        type: 'text',
        text: 'La prueba real de C2 no es entender un texto difícil, sino decir lo mismo tres veces y que cada versión encaje donde va.',
      },
      {
        type: 'table',
        head: ['Público', 'La misma noticia: llegaremos tarde'],
        rows: [
          ['Un amigo', 'Oye, que se nos ha hecho tardísimo, vamos para allá.'],
          ['Un compañero', 'Vamos con retraso, calculamos llegar sobre las siete.'],
          ['Un cliente', 'Les escribo para informarles de una demora prevista de una hora.'],
          ['Por escrito formal', 'Lamentamos comunicarles que la entrega sufrirá un retraso.'],
        ],
      },
      {
        type: 'rule',
        label: 'Lo que cambia con el registro',
        text: 'Sube el registro y ocurren tres cosas a la vez: el verbo se sustantiva (retraso, demora), aparece el plural corporativo (les informamos) y desaparece el agente (se ha producido).',
      },
      {
        type: 'warning',
        text: 'Pasarse de formal también es un error. Un correo a un compañero que empiece por Estimado señor crea una distancia que tendrás que deshacer después.',
      },
    ],
    examples: [
      { es: 'Lamentamos comunicarle que no ha sido seleccionado.', en: 'We regret to inform you that you have not been selected.', highlight: ['Lamentamos comunicarle'] },
      { es: 'Nada, que al final no te han cogido.', en: 'So basically, they didn’t take you in the end.', highlight: ['Nada, que'], note: 'Misma información, distancia opuesta.' },
    ],
    pitfalls: ['Mantener el mismo registro con todo el mundo.', 'Confundir formalidad con cortesía: se puede ser cercano y educado.'],
  },
];
