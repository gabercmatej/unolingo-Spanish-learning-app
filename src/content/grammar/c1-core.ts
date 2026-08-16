import type { GrammarConcept } from '@/content/types';

/**
 * C1 is not harder B2. The grammar here is almost entirely about *choice*: two
 * forms are both correct and they mean different things, or say the same thing
 * about the speaker rather than the world.
 *
 * So every card contrasts rather than instructs. There is no new paradigm in
 * this file — only places where picking one option over another changes the
 * implication.
 */
export const c1CoreGrammar: GrammarConcept[] = [
  {
    id: 'g.aunque-nuance',
    kind: 'grammar',
    level: 'C1',
    topics: ['opinions'],
    title: 'Aunque: conceding a fact or dismissing one',
    short: 'Indicative concedes what is known; subjunctive waves it aside.',
    requires: ['g.subjunctive-opinion'],
    summary: [
      {
        type: 'text',
        text: 'Both are grammatical. The mood tells your listener whether you are treating the information as established, or as something you are refusing to let matter.',
      },
      {
        type: 'contrast',
        left: {
          title: 'aunque + indicativo',
          caption: 'I know this, and I am granting it',
          tone: 'listening',
          examples: [
            { es: 'Aunque es caro, lo voy a comprar.', en: "Although it's expensive, I'm going to buy it.", note: 'It is expensive — established between us.' },
          ],
        },
        right: {
          title: 'aunque + subjuntivo',
          caption: 'Even if it were — irrelevant either way',
          tone: 'grammar',
          examples: [
            { es: 'Aunque sea caro, lo voy a comprar.', en: "Even if it's expensive, I'm going to buy it.", note: 'The price is beside the point.' },
          ],
        },
      },
      {
        type: 'rule',
        label: 'The same split runs through the family',
        text: 'a pesar de que, por más que, si bien and aun cuando all take both moods on the same logic: indicative for granted information, subjunctive for dismissed or unknown.',
      },
      {
        type: 'tip',
        text: 'Useful in argument: aunque tengas razón… concedes nothing, while aunque tienes razón… concedes the point before you object.',
      },
    ],
    examples: [
      { es: 'Aunque no te guste, es lo que hay.', en: "Even if you don't like it, that's how it is.", highlight: ['guste'] },
      { es: 'Aunque llegamos tarde, nos dejaron entrar.', en: 'Although we arrived late, they let us in.', highlight: ['llegamos'] },
    ],
    pitfalls: ['Defaulting to the subjunctive because aunque "takes" it — half the time it does not.'],
  },

  {
    id: 'g.lo-nominal',
    kind: 'grammar',
    level: 'C1',
    topics: ['opinions', 'describing'],
    title: 'Lo, and turning ideas into things',
    short: 'lo + adjective, lo que, lo de — how Spanish names abstractions.',
    requires: ['g.relatives'],
    summary: [
      {
        type: 'text',
        text: 'Spanish has no neuter noun, so it builds one on demand with lo. This is the single biggest stylistic marker between an advanced learner and a fluent one.',
      },
      {
        type: 'table',
        head: ['Structure', 'Means', 'Example'],
        rows: [
          ['lo + adjective', 'the … thing / part', 'lo difícil es empezar'],
          ['lo que', 'what / the thing that', 'lo que me molesta es el ruido'],
          ['lo de', 'that business with', 'lo de ayer fue raro'],
          ['lo + adj + que', 'how … it is', 'no sabes lo cansado que estoy'],
        ],
      },
      {
        type: 'tip',
        text: 'lo de is enormously useful and almost untranslatable: lo del trabajo, lo de tu hermano — "the whole thing about…" without having to name it.',
      },
      {
        type: 'rule',
        label: 'lo + adjetivo + que agrees',
        text: 'The adjective still agrees with what it describes: no sabes lo cansada que estoy (said by a woman), lo caras que son.',
      },
    ],
    examples: [
      { es: 'Lo difícil no es empezar, es seguir.', en: 'The hard part isn’t starting, it’s keeping going.', highlight: ['Lo difícil'] },
      { es: 'No te imaginas lo bien que se come allí.', en: 'You can’t imagine how well you eat there.', highlight: ['lo bien que'] },
      { es: 'Lo de la reunión lo dejamos para el lunes.', en: 'We’ll leave the meeting business until Monday.', highlight: ['Lo de'] },
    ],
    pitfalls: ['Reaching for el/la with an abstraction — "el difícil es…" is not Spanish.'],
  },

  {
    id: 'g.subjunctive-relative',
    kind: 'grammar',
    level: 'C1',
    topics: ['describing', 'work'],
    title: 'Someone who exists, or anyone who would do',
    short: 'The mood in a relative clause says whether the thing is real.',
    requires: ['g.relatives', 'g.subjunctive-opinion'],
    summary: [
      {
        type: 'contrast',
        left: {
          title: 'Indicative — a specific one',
          caption: 'It exists and I have it in mind',
          tone: 'listening',
          examples: [
            { es: 'Busco un piso que tiene terraza.', en: 'I’m looking for a flat that has a terrace.', note: 'A particular flat — I have seen the listing.' },
            { es: 'Conozco a alguien que habla ruso.', en: 'I know someone who speaks Russian.' },
          ],
        },
        right: {
          title: 'Subjunctive — any that fits',
          caption: 'Hypothetical, not yet identified',
          tone: 'grammar',
          examples: [
            { es: 'Busco un piso que tenga terraza.', en: 'I’m looking for a flat with a terrace.', note: 'Any flat, as long as it has one.' },
            { es: 'No conozco a nadie que hable ruso.', en: 'I don’t know anyone who speaks Russian.' },
          ],
        },
      },
      {
        type: 'rule',
        label: 'Negation forces it',
        text: 'If the antecedent does not exist, the subjunctive is compulsory: no hay nada que me guste, no encuentro a nadie que sepa.',
      },
      {
        type: 'tip',
        text: 'The concessive relative is very Spanish: digan lo que digan, pase lo que pase, sea como sea. Doubling the verb means "whatever / no matter".',
      },
    ],
    examples: [
      { es: 'Pase lo que pase, te aviso.', en: 'Whatever happens, I’ll let you know.', highlight: ['Pase lo que pase'] },
      { es: 'No hay nada que podamos hacer.', en: 'There’s nothing we can do.', highlight: ['podamos'] },
    ],
    pitfalls: ['Using the indicative after no hay nadie que / no hay nada que.'],
  },

  {
    id: 'g.reformulation',
    kind: 'grammar',
    level: 'C1',
    topics: ['opinions', 'work'],
    title: 'Saying it again, better',
    short: 'Nominalise, passivise, hedge — the same content at three temperatures.',
    summary: [
      {
        type: 'text',
        text: 'C1 is largely the ability to say something a second way: more formally, more briefly, or with the blame removed. The content stays; the packaging changes.',
      },
      {
        type: 'table',
        head: ['Move', 'Plain', 'Reformulated'],
        rows: [
          ['Nominalise', 'Decidieron cerrarlo.', 'La decisión de cerrarlo…'],
          ['Impersonalise', 'Hemos cometido un error.', 'Se ha cometido un error.'],
          ['Hedge', 'Es un desastre.', 'No termina de funcionar.'],
          ['Passivise (formal)', 'El gobierno aprobó la ley.', 'La ley fue aprobada.'],
        ],
      },
      {
        type: 'rule',
        label: 'Written Spanish nominalises heavily',
        text: 'Where speech uses a verb, formal writing prefers the noun: tras la aprobación de la ley rather than después de que aprobaran la ley.',
      },
      {
        type: 'warning',
        text: 'The ser + participle passive is far rarer in speech than in English. Spoken Spanish reaches for se or an unnamed third person plural: dicen que…, me lo han cobrado mal.',
      },
    ],
    examples: [
      { es: 'No es que no quiera, es que no puedo.', en: "It's not that I don't want to, it's that I can't.", highlight: ['No es que'], note: 'The classic hedge — and it takes the subjunctive.' },
      { es: 'Se ha cometido un error en la facturación.', en: 'An error has been made in the billing.', highlight: ['Se ha cometido'] },
    ],
    pitfalls: ['Overusing ser + participio in speech, which sounds translated.'],
  },
];
