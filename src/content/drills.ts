import type { CefrLevel } from '@/content/types';

/**
 * Hand-authored drills for the two exercise types that cannot be generated well.
 *
 * A believable learner error and a "technically possible but nobody says that"
 * sentence both require judgement — generating them produces straw men. These
 * are keyed to concepts so the scheduler can pull the right one when a concept
 * is weak.
 */

export interface ErrorDrill {
  id: string;
  /** The sentence containing a mistake. */
  wrong: string;
  /** Accepted corrections, first one shown as the model answer. */
  accepted: string[];
  /** Why it was wrong — the whole point of the exercise. */
  explanation: string;
  concepts: string[];
  level: CefrLevel;
}

export const errorDrills: ErrorDrill[] = [
  {
    id: 'd.e1',
    wrong: 'Yo soy cansado.',
    accepted: ['Estoy cansado.', 'Yo estoy cansado.', 'Estoy cansada.'],
    explanation: 'Tiredness is a state, so it takes estar. Ser cansado would mean you are a tiring person.',
    concepts: ['g.ser-estar', 'v.estar', 'v.cansado'],
    level: 'A1',
  },
  {
    id: 'd.e2',
    wrong: 'Madrid es en España.',
    accepted: ['Madrid está en España.'],
    explanation: 'Location always takes estar, even for something as permanent as a city.',
    concepts: ['g.ser-estar', 'v.estar'],
    level: 'A1',
  },
  {
    id: 'd.e3',
    wrong: 'Soy veintiún años.',
    accepted: ['Tengo veintiún años.'],
    explanation: 'Age is something you have in Spanish: tengo veintiún años.',
    concepts: ['g.tener-expressions', 'v.tener', 'v.anos'],
    level: 'A1',
  },
  {
    id: 'd.e4',
    wrong: 'Estoy hambre.',
    accepted: ['Tengo hambre.'],
    explanation: 'Hunger is another thing you *have*: tengo hambre.',
    concepts: ['g.tener-expressions', 'p.tengo-hambre'],
    level: 'A1',
  },
  {
    id: 'd.e5',
    wrong: 'Yo gusto el café.',
    accepted: ['Me gusta el café.', 'A mí me gusta el café.'],
    explanation: 'Gustar works backwards — the coffee does the pleasing, to me.',
    concepts: ['g.gustar', 'p.me-gusta'],
    level: 'A1',
  },
  {
    id: 'd.e6',
    wrong: 'Me gusta los perros.',
    accepted: ['Me gustan los perros.'],
    explanation: 'The thing liked is the subject. Plural thing → gustan.',
    concepts: ['g.gustar', 'p.me-gustan'],
    level: 'A2',
  },
  {
    id: 'd.e7',
    wrong: 'Hay el banco en la plaza.',
    accepted: ['Hay un banco en la plaza.', 'El banco está en la plaza.'],
    explanation: 'hay introduces something new (un banco). A specific, known thing takes está.',
    concepts: ['g.hay-estar'],
    level: 'A1',
  },
  {
    id: 'd.e8',
    wrong: 'Mi hermana es cansada hoy.',
    accepted: ['Mi hermana está cansada hoy.'],
    explanation: 'Hoy is the giveaway: a state right now means estar.',
    concepts: ['g.ser-estar', 'v.cansado'],
    level: 'A1',
  },
  {
    id: 'd.e9',
    wrong: 'Voy estudiar esta tarde.',
    accepted: ['Voy a estudiar esta tarde.'],
    explanation: 'ir a + infinitive — the a is not optional.',
    concepts: ['g.ir-a-infinitive'],
    level: 'A1',
  },
  {
    id: 'd.e10',
    wrong: 'Me gusta nada el fútbol.',
    accepted: ['No me gusta nada el fútbol.'],
    explanation: 'Spanish keeps both negatives: no … nada.',
    concepts: ['g.negation', 'p.no-me-gusta-nada'],
    level: 'A2',
  },
  {
    id: 'd.e11',
    wrong: 'Gracias para todo.',
    accepted: ['Gracias por todo.'],
    explanation: 'Thanks is always gracias por — the cause, not the destination.',
    concepts: ['g.por-para'],
    level: 'A2',
  },
  {
    id: 'd.e12',
    wrong: 'Levanto a las siete.',
    accepted: ['Me levanto a las siete.'],
    explanation: 'Levantarse is reflexive. Without me, you are lifting something else at seven.',
    concepts: ['g.reflexive', 'v.levantarse'],
    level: 'A2',
  },
  {
    id: 'd.e13',
    wrong: '¿A qué hora te acostáis?',
    accepted: ['¿A qué hora os acostáis?'],
    explanation: 'The verb is the vosotros form, so the pronoun has to be os.',
    concepts: ['g.reflexive', 'v.vosotros', 'v.acostarse'],
    level: 'A2',
  },
  {
    id: 'd.e14',
    wrong: 'He comida en casa.',
    accepted: ['He comido en casa.'],
    explanation: 'The participle never agrees after haber: he comido, always.',
    concepts: ['g.present-perfect'],
    level: 'A2',
  },
  {
    id: 'd.e15',
    wrong: 'Ayer he ido al cine.',
    accepted: ['Ayer fui al cine.'],
    explanation: 'Ayer is outside today, so Spain uses the preterite: fui.',
    concepts: ['g.preterite', 'g.present-perfect'],
    level: 'B1',
  },
  {
    id: 'd.e16',
    wrong: 'Doy le el libro.',
    accepted: ['Le doy el libro.'],
    explanation: 'Object pronouns go before a conjugated verb.',
    concepts: ['g.object-pronouns'],
    level: 'B1',
  },
  {
    id: 'd.e17',
    wrong: 'Quiero que tú vienes a la fiesta.',
    accepted: ['Quiero que vengas a la fiesta.', 'Quiero que tú vengas a la fiesta.'],
    explanation: 'querer que triggers the subjunctive: vengas.',
    concepts: ['g.subjunctive-intro'],
    level: 'B1',
  },
  {
    id: 'd.e18',
    wrong: 'Es una bonita ciudad muy.',
    accepted: ['Es una ciudad muy bonita.'],
    explanation: 'Adjectives follow the noun, and muy goes directly before the adjective.',
    concepts: ['g.adjective-agreement', 'v.muy'],
    level: 'A1',
  },
  {
    id: 'd.e19',
    wrong: 'La problema es difícil.',
    accepted: ['El problema es difícil.'],
    explanation: 'Problema ends in -ma and is masculine, despite the -a.',
    concepts: ['g.gender'],
    level: 'A1',
  },
  {
    id: 'd.e20',
    wrong: '¿Dónde es el metro?',
    accepted: ['¿Dónde está el metro?'],
    explanation: 'Asking where something is always needs estar.',
    concepts: ['g.ser-estar', 'p.donde-esta'],
    level: 'A1',
  },
  {
    id: 'd.e21',
    wrong: 'Conozco que Madrid es grande.',
    accepted: ['Sé que Madrid es grande.'],
    explanation: 'Facts take saber. Conocer is for being familiar with people and places.',
    concepts: ['v.saber', 'v.conocer'],
    level: 'A2',
  },
  {
    id: 'd.e22',
    wrong: 'Escucho a música cuando cocino.',
    accepted: ['Escucho música cuando cocino.'],
    explanation: 'Escuchar takes no preposition before a thing: escucho música.',
    concepts: ['v.escuchar'],
    level: 'A2',
  },

  // --- A2: the errors that survive past the first month ---------------------
  {
    id: 'd.e23',
    wrong: 'Tengo que a trabajar mañana.',
    accepted: ['Tengo que trabajar mañana.'],
    explanation: 'tener que takes the bare infinitive. Only ir adds the a: voy a trabajar.',
    concepts: ['g.ir-a-infinitive', 'v.trabajar'],
    level: 'A2',
  },
  {
    id: 'd.e24',
    wrong: 'Estoy aburrido de esta película, es muy aburrida… soy aburrido.',
    accepted: ['Estoy aburrido de esta película, es muy aburrida.'],
    explanation: 'Ser aburrido means you are a boring person. The state of being bored is always estar.',
    concepts: ['g.ser-estar'],
    level: 'A2',
  },
  {
    id: 'd.e25',
    wrong: 'Voy a la casa de mi madre en coche todos los domingos por coger el metro.',
    accepted: ['Voy a casa de mi madre en coche todos los domingos para no coger el metro.'],
    explanation: 'Purpose is para, never por — and a casa (no article) when it is someone’s home.',
    concepts: ['g.por-para', 'v.coche'],
    level: 'A2',
  },
  {
    id: 'd.e26',
    wrong: 'Me duele mis pies después de andar tanto.',
    accepted: ['Me duelen los pies después de andar tanto.'],
    explanation: 'Doler works like gustar — plural body parts take duelen — and Spanish uses the article, not the possessive, for your own body.',
    concepts: ['p.me-duele', 'g.gustar'],
    level: 'A2',
  },
  {
    id: 'd.e27',
    wrong: 'Hace dos años que vivo aquí, y antes yo he vivido en Sevilla.',
    accepted: ['Hace dos años que vivo aquí, y antes viví en Sevilla.'],
    explanation: 'A finished period disconnected from today takes the preterite, even in Spain.',
    concepts: ['g.present-perfect', 'g.preterite'],
    level: 'A2',
  },
  {
    id: 'd.e28',
    wrong: 'Esta camisa es más barata que esa, pero esa es la más buena.',
    accepted: ['Esta camisa es más barata que esa, pero esa es la mejor.'],
    explanation: 'Bueno has an irregular comparative: mejor, never más bueno.',
    concepts: ['g.comparisons', 'v.barato'],
    level: 'A2',
  },
  {
    id: 'd.e29',
    wrong: 'Hay mucho gente en la plaza esta tarde.',
    accepted: ['Hay mucha gente en la plaza esta tarde.'],
    explanation: 'Gente is feminine and singular in Spanish, however plural it feels: mucha gente está.',
    concepts: ['g.gender', 'v.gente'],
    level: 'A2',
  },
  {
    id: 'd.e30',
    wrong: 'Me gusta mucho de viajar en tren.',
    accepted: ['Me gusta mucho viajar en tren.'],
    explanation: 'Gustar takes the infinitive directly — the de is imported from English "fond of".',
    concepts: ['g.gustar', 'v.viajar'],
    level: 'A2',
  },

  // --- B1: past tenses, pronouns and the first subjunctive ------------------
  {
    id: 'd.e31',
    wrong: 'Cuando era pequeño, un día me rompí la pierna mientras jugué al fútbol.',
    accepted: ['Cuando era pequeño, un día me rompí la pierna mientras jugaba al fútbol.'],
    explanation: 'Mientras sets the background scene, so it takes the imperfect. The single event stays preterite.',
    concepts: ['g.preterite-imperfect', 'v.mientras'],
    level: 'B1',
  },
  {
    id: 'd.e32',
    wrong: 'Realicé que había perdido el móvil.',
    accepted: ['Me di cuenta de que había perdido el móvil.'],
    explanation: 'Realizar means to carry out. To realise something is darse cuenta de — and the de is obligatory.',
    concepts: ['p.darse-cuenta', 'g.pluperfect'],
    level: 'B1',
  },
  {
    id: 'd.e33',
    wrong: 'Te lo voy a explicar, pero primero quiero que tú entiendes el contexto.',
    accepted: ['Te lo voy a explicar, pero primero quiero que entiendas el contexto.'],
    explanation: 'querer que always triggers the subjunctive in the second clause: que entiendas.',
    concepts: ['g.subjunctive-intro'],
    level: 'B1',
  },
  {
    id: 'd.e34',
    wrong: 'He visto a María ayer y la dije que viniera.',
    accepted: ['Vi a María ayer y le dije que viniera.'],
    explanation: 'Two fixes: ayer forces the preterite, and decir takes an indirect object — le, not la.',
    concepts: ['g.object-pronouns', 'g.preterite'],
    level: 'B1',
  },
  {
    id: 'd.e35',
    wrong: 'Estoy muy harto con este ruido.',
    accepted: ['Estoy muy harto de este ruido.'],
    explanation: 'harto fixes on de: estar harto de algo.',
    concepts: ['v.harto'],
    level: 'B1',
  },
  {
    id: 'd.e36',
    wrong: 'Yo que tú, hablaría con el jefe… no, yo que tú hablo con el jefe.',
    accepted: ['Yo que tú, hablaría con el jefe.'],
    explanation: 'yo que tú is followed by the conditional — it is a hypothetical, not a plan.',
    concepts: ['p.yo-que-tu', 'g.conditional'],
    level: 'B1',
  },
  {
    id: 'd.e37',
    wrong: 'Te recomiendo que vas al Prado por la mañana.',
    accepted: ['Te recomiendo que vayas al Prado por la mañana.'],
    explanation: 'Recommending is influencing someone, so the subjunctive follows: que vayas.',
    concepts: ['p.te-recomiendo', 'g.subjunctive-intro'],
    level: 'B1',
  },
  {
    id: 'd.e38',
    wrong: 'Echo de menos a mi familia, los extraño mucho cada día.',
    accepted: ['Echo de menos a mi familia, los echo mucho de menos cada día.'],
    explanation: 'Both are correct Spanish, but extrañar is the Latin-American form. In Spain you echar de menos throughout.',
    concepts: ['p.echar-de-menos'],
    level: 'B1',
  },
  {
    id: 'd.e39',
    wrong: 'El tren tiene un retraso de veinte minutos, por eso que llegaré tarde.',
    accepted: ['El tren tiene un retraso de veinte minutos, por eso llegaré tarde.'],
    explanation: 'por eso is already a connector. Adding que turns it into nothing at all.',
    concepts: ['v.por-eso', 'v.retraso'],
    level: 'B1',
  },
  {
    id: 'd.e40',
    wrong: 'Tengo ganas de que viene el verano.',
    accepted: ['Tengo ganas de que venga el verano.'],
    explanation: 'tener ganas de que wants something not yet real — subjunctive: que venga.',
    concepts: ['p.tener-ganas', 'g.subjunctive-intro'],
    level: 'B1',
  },

  // --- B2: the hypotheticals, the reporting, the concessions ----------------
  {
    id: 'd.e41',
    wrong: 'Si tendría más tiempo, me apuntaría a un curso.',
    accepted: ['Si tuviera más tiempo, me apuntaría a un curso.', 'Si tuviese más tiempo, me apuntaría a un curso.'],
    explanation: 'The si clause never takes the conditional. si tuviera → me apuntaría. "Si tendría" is the single most recognisable non-native error at B2.',
    concepts: ['g.si-hypothetical', 'g.conditional'],
    level: 'B2',
  },
  {
    id: 'd.e42',
    wrong: 'No creo que es tan sencillo como parece.',
    accepted: ['No creo que sea tan sencillo como parece.'],
    explanation: 'Creo que takes the indicative; negate it and the doubt forces the subjunctive: no creo que sea.',
    concepts: ['g.subjunctive-opinion'],
    level: 'B2',
  },
  {
    id: 'd.e43',
    wrong: 'Puede que viene mañana, no me extrañaría.',
    accepted: ['Puede que venga mañana, no me extrañaría.'],
    explanation: 'puede que is always followed by the subjunctive. Its cousin a lo mejor is the exception that keeps the indicative.',
    concepts: ['p.puede-que', 'p.no-me-extrana'],
    level: 'B2',
  },
  {
    id: 'd.e44',
    wrong: 'A lo mejor venga esta tarde, no lo sé.',
    accepted: ['A lo mejor viene esta tarde, no lo sé.'],
    explanation: 'The trap in reverse: a lo mejor looks like a doubt trigger but takes the indicative.',
    concepts: ['p.a-lo-mejor'],
    level: 'B2',
  },
  {
    id: 'd.e45',
    wrong: 'Por mucho que insistes, no voy a cambiar de opinión.',
    accepted: ['Por mucho que insistas, no voy a cambiar de opinión.'],
    explanation: 'por mucho que concedes something hypothetical, so it takes the subjunctive: insistas.',
    concepts: ['p.por-mucho-que', 'g.subjunctive-opinion'],
    level: 'B2',
  },
  {
    id: 'd.e46',
    wrong: 'Me dijo que está agobiado y que necesita unos días libres.',
    accepted: ['Me dijo que estaba agobiado y que necesitaba unos días libres.'],
    explanation: 'Reporting in the past drags the whole sentence back with it: está → estaba, necesita → necesitaba.',
    concepts: ['g.reported-speech', 'v.agobiado'],
    level: 'B2',
  },
  {
    id: 'd.e47',
    wrong: 'Me comentó que vendría mañana.',
    accepted: ['Me comentó que vendría al día siguiente.'],
    explanation: 'Time references shift along with the tense. Reported from the past, mañana becomes al día siguiente.',
    concepts: ['p.me-comento-que', 'g.reported-speech'],
    level: 'B2',
  },
  {
    id: 'd.e48',
    wrong: 'El jefe nos pidió que llegamos antes.',
    accepted: ['El jefe nos pidió que llegáramos antes.', 'El jefe nos pidió que llegásemos antes.'],
    explanation: 'A request reported in the past takes the imperfect subjunctive: que llegáramos.',
    concepts: ['g.reported-speech', 'v.jefe'],
    level: 'B2',
  },
  {
    id: 'd.e49',
    wrong: 'A pesar de que el paro ha bajado, la gente todavía está preocupada por el trabajo… a pesar el paro ha bajado.',
    accepted: ['A pesar de que el paro ha bajado, la gente todavía está preocupada por el trabajo.'],
    explanation: 'Before a full clause it is a pesar de que. A pesar de alone can only take a noun: a pesar del paro.',
    concepts: ['p.a-pesar-de', 'v.paro'],
    level: 'B2',
  },
  {
    id: 'd.e50',
    wrong: 'Exigen que trabajamos los sábados y encima sin pagar.',
    accepted: ['Exigen que trabajemos los sábados y encima sin pagar.'],
    explanation: 'exigir imposes a will on someone else, so the subjunctive follows: que trabajemos.',
    concepts: ['v.exigir', 'g.subjunctive-opinion'],
    level: 'B2',
  },
  {
    id: 'd.e51',
    wrong: 'Estoy de acuerdo contigo, pero en mi opinión yo creo que el alquiler es el problema.',
    accepted: ['Estoy de acuerdo contigo, pero en mi opinión el alquiler es el problema.'],
    explanation: 'en mi opinión and yo creo que do the same job. Stacking them is a tell that you are translating.',
    concepts: ['p.en-mi-opinion', 'v.alquiler'],
    level: 'B2',
  },
  {
    id: 'd.e52',
    wrong: 'Hay que tener en cuenta de que no todo el mundo tiene coche.',
    accepted: ['Hay que tener en cuenta que no todo el mundo tiene coche.'],
    explanation: 'tener en cuenta que — no de. Adding it is dequeísmo, and Spaniards notice.',
    concepts: ['p.hay-que-tener-en-cuenta', 'p.tener-en-cuenta'],
    level: 'B2',
  },

  // --- C1: nuance, register and the choice between two correct forms --------
  {
    id: 'd.e53',
    wrong: 'Busco un piso que tiene terraza, cualquiera me vale.',
    accepted: ['Busco un piso que tenga terraza, cualquiera me vale.'],
    explanation: 'Cualquiera reveals the flat is hypothetical, so the relative clause needs the subjunctive: que tenga.',
    concepts: ['g.subjunctive-relative', 'g.relatives'],
    level: 'C1',
  },
  {
    id: 'd.e54',
    wrong: 'Aunque tengas razón, los datos dicen otra cosa y eso ya lo sabemos todos.',
    accepted: ['Aunque tienes razón, los datos dicen otra cosa y eso ya lo sabemos todos.'],
    explanation: 'The speaker accepts the point as a known fact, so the indicative is right. Aunque tengas would concede it only hypothetically.',
    concepts: ['g.aunque-nuance', 'p.tener-razon'],
    level: 'C1',
  },
  {
    id: 'd.e55',
    wrong: 'El difícil no es empezar, es mantenerlo.',
    accepted: ['Lo difícil no es empezar, es mantenerlo.'],
    explanation: 'lo + adjective names the abstract quality. El difícil would have to refer to a specific masculine thing.',
    concepts: ['g.lo-nominal'],
    level: 'C1',
  },
  {
    id: 'd.e56',
    wrong: 'De ahí que es tan complicado encontrar piso en el centro.',
    accepted: ['De ahí que sea tan complicado encontrar piso en el centro.'],
    explanation: 'de ahí que always takes the subjunctive, however factual the consequence feels.',
    concepts: ['p.de-ahi-que'],
    level: 'C1',
  },
  {
    id: 'd.e57',
    wrong: 'Te ayudo, siempre y cuando me avisas con tiempo.',
    accepted: ['Te ayudo, siempre y cuando me avises con tiempo.'],
    explanation: 'siempre y cuando sets a condition that has not happened yet — subjunctive: me avises.',
    concepts: ['p.siempre-y-cuando'],
    level: 'C1',
  },
  {
    id: 'd.e58',
    wrong: 'No es que no me gusta, es que no me convence del todo.',
    accepted: ['No es que no me guste, es que no me convence del todo.'],
    explanation: 'The dismissed explanation takes the subjunctive; the real one that follows stays indicative.',
    concepts: ['p.no-es-que', 'p.no-termina-de'],
    level: 'C1',
  },
  {
    id: 'd.e59',
    wrong: 'Asumo que llegará tarde, siempre le pasa lo mismo.',
    accepted: ['Supongo que llegará tarde, siempre le pasa lo mismo.'],
    explanation: 'A false friend worth unlearning: asumir is to take on a responsibility. To assume in the English sense is suponer.',
    concepts: ['v.asumir', 'p.supongo-que'],
    level: 'C1',
  },
  {
    id: 'd.e60',
    wrong: 'Permítame que matizo una cosa antes de continuar.',
    accepted: ['Permítame que matice una cosa antes de continuar.'],
    explanation: 'permitir que triggers the subjunctive — and this is the standard formal opening for a correction.',
    concepts: ['v.matizar', 'g.register'],
    level: 'C1',
  },
  {
    id: 'd.e61',
    wrong: 'Estoy reticente a firmar hasta que veo el contrato entero.',
    accepted: ['Soy reticente a firmar hasta que vea el contrato entero.'],
    explanation: 'Two moves at once: hasta que about the future takes the subjunctive, and reticente describes a stance, so it pairs with ser here.',
    concepts: ['v.reticente', 'g.ser-estar'],
    level: 'C1',
  },

  // --- C2: precision, collocation and calque ------------------------------
  {
    id: 'd.e62',
    wrong: 'No quiero tomar ese riesgo sin hablarlo antes.',
    accepted: ['No quiero asumir ese riesgo sin hablarlo antes.'],
    explanation: 'A risk is assumed, not taken. tomar un riesgo is a straight calque of the English.',
    concepts: ['p.asumir-un-riesgo', 'v.asumir'],
    level: 'C2',
  },
  {
    id: 'd.e63',
    wrong: 'Quería hacer una duda sobre el segundo punto.',
    accepted: ['Quería plantear una duda sobre el segundo punto.'],
    explanation: 'Spanish fixes the verb to the noun: se plantea una duda, se despeja una duda. Hacer belongs with pregunta.',
    concepts: ['p.plantear-una-duda', 'v.plantear'],
    level: 'C2',
  },
  {
    id: 'd.e64',
    wrong: 'El ministro alegó que la inflación había bajado, y los datos le dieron la razón.',
    accepted: ['El ministro afirmó que la inflación había bajado, y los datos le dieron la razón.'],
    explanation: 'alegar carries a whiff of excuse — it undercuts the claim. When the facts back the speaker, afirmar or sostener is the honest verb.',
    concepts: ['v.alegar', 'v.afirmar'],
    level: 'C2',
  },
  {
    id: 'd.e65',
    wrong: 'Hubo un pequeño problema con el vuelo, nada grave, un retraso de media hora.',
    accepted: ['Hubo un pequeño contratiempo con el vuelo, nada grave, un retraso de media hora.'],
    explanation: 'Not wrong, but problema is heavier than the situation. contratiempo does the deliberate softening that nada grave has already signalled.',
    concepts: ['v.contratiempo', 'v.inconveniente'],
    level: 'C2',
  },
  {
    id: 'd.e66',
    wrong: 'Su reacción fue muy tibia, estaba realmente contundente.',
    accepted: ['Su reacción fue muy tibia, no fue nada contundente.'],
    explanation: 'tibio and contundente sit at opposite ends of the same scale — a lukewarm reaction cannot also be emphatic.',
    concepts: ['v.tibio', 'v.contundente'],
    level: 'C2',
  },
  {
    id: 'd.e67',
    wrong: 'Vamos a ir directamente al grano, que tenemos poco tiempo.',
    accepted: ['Vamos a ir al grano, que tenemos poco tiempo.'],
    explanation: 'ir al grano is fixed. Padding it with directamente breaks the idiom and says the same thing twice.',
    concepts: ['p.ir-al-grano', 'p.andarse-con-rodeos'],
    level: 'C2',
  },
  {
    id: 'd.e68',
    wrong: 'Creo que no me expliqué bien, a lo que me refiero es que hay dos problemas distintos.',
    accepted: ['Creo que no me expliqué bien, a lo que me refiero es a que hay dos problemas distintos.'],
    explanation: 'referirse fixes on a, and the preposition has to reappear before the que: es a que.',
    concepts: ['p.a-lo-que-me-refiero', 'p.no-me-he-explicado'],
    level: 'C2',
  },
  {
    id: 'd.e69',
    wrong: 'Esa decisión va a sentar un precedente, no cabe duda que lo hará.',
    accepted: ['Esa decisión va a sentar un precedente, no cabe duda de que lo hará.'],
    explanation: 'no cabe duda de que keeps its de. Dropping it is queísmo — the mirror image of the dequeísmo that B2 learns to avoid.',
    concepts: ['p.no-cabe-duda', 'p.sentar-precedente'],
    level: 'C2',
  },
  {
    id: 'd.e70',
    wrong: 'Lejos de resolver el asunto, la nueva norma lo ha empeorado y ha dado pie para más quejas.',
    accepted: ['Lejos de resolver el asunto, la nueva norma lo ha empeorado y ha dado pie a más quejas.'],
    explanation: 'dar pie takes a, not para. The whole point of a collocation is that the preposition is not negotiable.',
    concepts: ['p.dar-pie-a', 'p.lejos-de'],
    level: 'C2',
  },
];

export interface NaturalDrill {
  id: string;
  /** What the learner is trying to express. */
  situation: string;
  options: { es: string; en: string; natural: boolean; note?: string }[];
  concepts: string[];
  level: CefrLevel;
}

export const naturalDrills: NaturalDrill[] = [
  {
    id: 'd.n1',
    situation: 'You want a coffee with milk in a Madrid bar.',
    options: [
      { es: '¿Me pones un café con leche?', en: 'Can I get a coffee with milk?', natural: true },
      {
        es: 'Yo deseo un café con leche.',
        en: 'I desire a coffee with milk.',
        natural: false,
        note: 'Grammatical, but desear belongs in a formal letter. Nobody orders like this.',
      },
    ],
    concepts: ['p.me-pones', 'p.cafe-con-leche'],
    level: 'A2',
  },
  {
    id: 'd.n2',
    situation: 'You are suggesting a drink after class.',
    options: [
      { es: '¿Tomamos algo después de clase?', en: 'Shall we grab a drink after class?', natural: true },
      {
        es: '¿Bebemos una bebida después de clase?',
        en: 'Shall we drink a drink after class?',
        natural: false,
        note: 'Beber is for the physical act. Socially, Spaniards tomar algo.',
      },
    ],
    concepts: ['p.tomar-algo', 'v.tomar'],
    level: 'A2',
  },
  {
    id: 'd.n3',
    situation: 'You are saying goodbye to the person in a shop.',
    options: [
      { es: '¡Hasta luego!', en: 'See you later!', natural: true },
      {
        es: '¡Adiós para siempre!',
        en: 'Goodbye forever!',
        natural: false,
        note: 'Hasta luego is the default goodbye in Spain, even to people you will never see again.',
      },
    ],
    concepts: ['p.hasta-luego', 'v.adios'],
    level: 'A1',
  },
  {
    id: 'd.n4',
    situation: 'A friend asks if you want to meet tomorrow.',
    options: [
      { es: 'Vale, ¿a qué hora quedamos?', en: 'Okay, what time shall we meet?', natural: true },
      {
        es: 'Sí, ¿en qué momento nos encontramos?',
        en: 'Yes, at what moment shall we encounter each other?',
        natural: false,
        note: 'Encontrarse is meeting by chance. Arranging a plan is quedar.',
      },
    ],
    concepts: ['v.quedar', 'v.vale'],
    level: 'A2',
  },
  {
    id: 'd.n5',
    situation: 'You want to say you fancy a beer.',
    options: [
      { es: 'Me apetece una caña.', en: 'I fancy a small beer.', natural: true },
      {
        es: 'Yo apetezco una caña.',
        en: 'I fancy a small beer.',
        natural: false,
        note: 'Apetecer works like gustar — it is me apetece, never yo apetezco.',
      },
    ],
    concepts: ['p.me-apetece', 'v.cana'],
    level: 'A2',
  },
  {
    id: 'd.n6',
    situation: 'You are stopping a stranger to ask where the station is.',
    options: [
      { es: 'Perdona, ¿sabes dónde está la estación?', en: 'Excuse me, do you know where the station is?', natural: true },
      {
        es: '¡Oye! ¿La estación?',
        en: 'Oi! The station?',
        natural: false,
        note: 'Understandable, but abrupt. Perdona softens the approach.',
      },
    ],
    concepts: ['p.perdona-donde', 'v.perdona'],
    level: 'A2',
  },
  {
    id: 'd.n7',
    situation: 'You are telling a friend you take the metro every day.',
    options: [
      { es: 'Cojo el metro todos los días.', en: 'I take the metro every day.', natural: true },
      {
        es: 'Tomo el metro todos los días.',
        en: 'I take the metro every day.',
        natural: false,
        note: 'Not wrong — and standard in Latin America — but in Spain you coger the metro.',
      },
    ],
    concepts: ['v.coger', 'v.metro'],
    level: 'A2',
  },
  {
    id: 'd.n8',
    situation: 'You are asking a friend how they are.',
    options: [
      { es: '¿Qué tal?', en: 'How’s it going?', natural: true },
      {
        es: '¿Cómo se encuentra usted?',
        en: 'How do you find yourself, sir?',
        natural: false,
        note: 'Correct, but this is what a doctor says. Between friends it is ¿qué tal?',
      },
    ],
    concepts: ['p.que-tal', 'v.usted'],
    level: 'A1',
  },
  {
    id: 'd.n9',
    situation: 'You want to book a table for two.',
    options: [
      { es: 'Quería reservar una mesa para dos.', en: 'I’d like to book a table for two.', natural: true },
      {
        es: 'Quiero una mesa para dos ahora.',
        en: 'I want a table for two now.',
        natural: false,
        note: 'Quiero is blunt here. The imperfect quería is the standard politeness softener.',
      },
    ],
    concepts: ['v.reservar', 'v.querer', 'v.mesa'],
    level: 'A2',
  },
  {
    id: 'd.n10',
    situation: 'A friend tells you something surprising.',
    options: [
      { es: '¡Qué fuerte!', en: 'No way!', natural: true },
      {
        es: '¡Qué sorprendente es eso!',
        en: 'How surprising that is!',
        natural: false,
        note: 'Reads like a subtitle. Spaniards say qué fuerte, no me digas or ¿en serio?',
      },
    ],
    concepts: ['p.que-fuerte'],
    level: 'B1',
  },
  {
    id: 'd.n11',
    situation: 'You want to say a song is great.',
    options: [
      { es: 'Esa canción mola mucho.', en: 'That song is really cool.', natural: true },
      {
        es: 'Esa canción es muy guay para mí.',
        en: 'That song is very cool for me.',
        natural: false,
        note: 'The para mí is a literal translation of English. Just say me mola or me encanta.',
      },
    ],
    concepts: ['v.molar', 'p.que-guay'],
    level: 'B1',
  },
  {
    id: 'd.n12',
    situation: 'You are leaving a friend’s house at night.',
    options: [
      { es: 'Bueno, me voy, que es tarde.', en: 'Right, I’m off, it’s late.', natural: true },
      {
        es: 'Ahora yo salgo porque la hora es tardía.',
        en: 'Now I exit because the hour is late.',
        natural: false,
        note: 'Every word is a dictionary translation. The natural version uses irse and a colloquial que.',
      },
    ],
    concepts: ['v.bueno', 'g.reflexive'],
    level: 'B1',
  },

  // --- A1 / A2: the first choices that already sound foreign ----------------
  {
    id: 'd.n13',
    situation: 'You are meeting your friend’s mother for the first time.',
    options: [
      { es: 'Encantado, ¿qué tal?', en: 'Nice to meet you, how are you?', natural: true },
      {
        es: 'Es un placer conocerla a usted, señora.',
        en: 'It is a pleasure to make your acquaintance, madam.',
        natural: false,
        note: 'Correct, but far too formal for a friend’s mother in Spain. Usted here creates distance rather than respect.',
      },
    ],
    concepts: ['p.encantado', 'v.usted'],
    level: 'A2',
  },
  {
    id: 'd.n14',
    situation: 'A shop assistant asks if you need help and you are just browsing.',
    options: [
      { es: 'No, gracias, solo estoy mirando.', en: 'No thanks, I’m just looking.', natural: true },
      {
        es: 'No, gracias, solamente observo los productos.',
        en: 'No thanks, I am merely observing the products.',
        natural: false,
        note: 'Observar is for watching a phenomenon. Browsing a shop is estar mirando, every time.',
      },
    ],
    concepts: ['v.tienda', 'v.ropa'],
    level: 'A2',
  },
  {
    id: 'd.n15',
    situation: 'You want to ask how much something costs in a market.',
    options: [
      { es: '¿Cuánto vale?', en: 'How much is it?', natural: true },
      {
        es: '¿Cuál es el precio de este objeto?',
        en: 'What is the price of this object?',
        natural: false,
        note: 'Reads like a form. In a Spanish market it is ¿cuánto vale? or ¿cuánto es?',
      },
    ],
    concepts: ['v.cuanto', 'p.cuanto-cuesta'],
    level: 'A2',
  },
  {
    id: 'd.n16',
    situation: 'You did not hear what someone said in a noisy bar.',
    options: [
      { es: '¿Cómo?', en: 'Sorry?', natural: true },
      {
        es: '¿Qué?',
        en: 'What?',
        natural: false,
        note: 'Understood everywhere, but blunt to a stranger. ¿Cómo? or ¿perdona? is the neutral repair in Spain.',
      },
    ],
    concepts: ['p.puedes-repetir', 'p.perdona-donde'],
    level: 'A2',
  },

  // --- B1: the level where calques become the main giveaway -----------------
  {
    id: 'd.n17',
    situation: 'You want to say you had a great time at the party.',
    options: [
      { es: 'Me lo pasé genial en la fiesta.', en: 'I had a great time at the party.', natural: true },
      {
        es: 'Tuve un tiempo muy bueno en la fiesta.',
        en: 'I had a very good time at the party.',
        natural: false,
        note: 'Tiempo is weather or clock time. Enjoying yourself is pasarlo bien — and Spain keeps the lo.',
      },
    ],
    concepts: ['p.pasarlo-bien'],
    level: 'B1',
  },
  {
    id: 'd.n18',
    situation: 'A colleague apologises for a small mistake and you want to wave it off.',
    options: [
      { es: 'Nada, no pasa nada.', en: 'Don’t worry about it.', natural: true },
      {
        es: 'Está bien, te perdono.',
        en: 'It’s alright, I forgive you.',
        natural: false,
        note: 'Perdonar makes the mistake sound serious. no pasa nada closes it without ceremony.',
      },
    ],
    concepts: ['p.no-pasa-nada', 'p.lo-siento-mucho'],
    level: 'B1',
  },
  {
    id: 'd.n19',
    situation: 'You want to tell a friend they should talk to their boss about the hours.',
    options: [
      { es: 'Yo que tú hablaría con tu jefe.', en: 'If I were you I’d talk to your boss.', natural: true },
      {
        es: 'Debes hablar con tu jefe inmediatamente.',
        en: 'You must speak to your boss immediately.',
        natural: false,
        note: 'Deber is an obligation you impose. Advice between friends goes through deberías or yo que tú.',
      },
    ],
    concepts: ['p.yo-que-tu', 'p.deberias', 'v.jefe'],
    level: 'B1',
  },
  {
    id: 'd.n20',
    situation: 'Your train is delayed and you are telling a friend why you are late.',
    options: [
      { es: 'Es que el tren lleva media hora de retraso.', en: 'It’s just that the train is half an hour late.', natural: true },
      {
        es: 'La razón es que el tren tiene un retraso de media hora.',
        en: 'The reason is that the train has a delay of half an hour.',
        natural: false,
        note: 'Grammatical but stiff. Spoken Spanish opens an excuse with es que — it is almost obligatory.',
      },
    ],
    concepts: ['v.retraso', 'v.tren'],
    level: 'B1',
  },
  {
    id: 'd.n21',
    situation: 'You are asking a colleague to look over a document quickly.',
    options: [
      { es: '¿Le puedes echar un vistazo cuando tengas un momento?', en: 'Can you have a quick look when you have a moment?', natural: true },
      {
        es: '¿Puedes revisar completamente este documento ahora?',
        en: 'Can you fully review this document now?',
        natural: false,
        note: 'That is a different, much bigger request. echar un vistazo is precisely the "quick look" register.',
      },
    ],
    concepts: ['p.echar-un-vistazo', 'p.prestar-atencion'],
    level: 'B1',
  },

  // --- B2: hedging, conceding and sounding like you are arguing, not reciting
  {
    id: 'd.n22',
    situation: 'A colleague proposes something you think is unrealistic, and you want to disagree without a confrontation.',
    options: [
      { es: 'Puede ser, pero no creo que sea tan fácil.', en: 'Maybe, but I don’t think it’s that easy.', natural: true },
      {
        es: 'Estás equivocado, eso no es fácil.',
        en: 'You are wrong, that is not easy.',
        natural: false,
        note: 'Correct Spanish and a slammed door. Disagreement in Spain concedes first, then objects.',
      },
    ],
    concepts: ['p.puede-ser-pero', 'g.subjunctive-opinion'],
    level: 'B2',
  },
  {
    id: 'd.n23',
    situation: 'You are not certain your friend will turn up, and you say so casually.',
    options: [
      { es: 'A lo mejor viene, pero yo no contaría con ello.', en: 'Maybe he’ll come, but I wouldn’t count on it.', natural: true },
      {
        es: 'Quizá él vendrá, pero yo no contaría con ello.',
        en: 'Perhaps he will come, but I wouldn’t count on it.',
        natural: false,
        note: 'Quizá is fine in writing, and the explicit él is heavier still. In everyday speech Spain says a lo mejor.',
      },
    ],
    concepts: ['p.a-lo-mejor', 'p.igual-viene'],
    level: 'B2',
  },
  {
    id: 'd.n24',
    situation: 'You are about to give the real objection after appearing to agree.',
    options: [
      { es: 'Sí, sí, lo que pasa es que no hay presupuesto.', en: 'Yes, yes — the thing is there’s no budget.', natural: true },
      {
        es: 'Sí, sí. Sin embargo, no existe presupuesto.',
        en: 'Yes, yes. However, no budget exists.',
        natural: false,
        note: 'Sin embargo is a written connector. In conversation the pivot is lo que pasa es que.',
      },
    ],
    concepts: ['p.lo-que-pasa-es', 'v.sin-embargo'],
    level: 'B2',
  },
  {
    id: 'd.n25',
    situation: 'You are emailing a client to ask them to confirm an appointment.',
    options: [
      { es: 'Le agradecería que me confirmara la cita por correo.', en: 'I’d be grateful if you could confirm the appointment by email.', natural: true },
      {
        es: 'Confírmame la cita por correo, porfa.',
        en: 'Confirm the appointment by email, pls.',
        natural: false,
        note: 'Fine for a friend, wrong for a client. Formal Spanish softens with the conditional plus imperfect subjunctive.',
      },
    ],
    concepts: ['g.register', 'v.cita'],
    level: 'B2',
  },
  {
    id: 'd.n26',
    situation: 'A friend tells you the rent has gone up again and you are not remotely surprised.',
    options: [
      { es: 'No me extraña, con cómo está la vivienda.', en: 'Doesn’t surprise me, the way housing is.', natural: true },
      {
        es: 'Eso no es sorprendente para mí, considerando la vivienda.',
        en: 'That is not surprising to me, considering housing.',
        natural: false,
        note: 'A word-for-word English structure. The ready-made Spanish reaction is no me extraña.',
      },
    ],
    concepts: ['p.no-me-extrana', 'v.vivienda'],
    level: 'B2',
  },
  {
    id: 'd.n27',
    situation: 'You are wrapping up a long digression and getting back to your story.',
    options: [
      { es: 'Total, que al final no fuimos.', en: 'Anyway, so in the end we didn’t go.', natural: true },
      {
        es: 'En conclusión, finalmente no asistimos.',
        en: 'In conclusion, we ultimately did not attend.',
        natural: false,
        note: 'That is how you end an essay, not an anecdote. Spoken Spanish resumes with total, que…',
      },
    ],
    concepts: ['p.en-plan-b2', 'v.al-final'],
    level: 'B2',
  },

  // --- C1: choosing between forms that are all grammatical -----------------
  {
    id: 'd.n28',
    situation: 'You are looking for a flat with a terrace — any flat, as long as it has one.',
    options: [
      { es: 'Busco un piso que tenga terraza.', en: 'I’m looking for a flat with a terrace.', natural: true },
      {
        es: 'Busco un piso que tiene terraza.',
        en: 'I’m looking for the flat that has a terrace.',
        natural: false,
        note: 'Also grammatical, but it says you have a specific known flat in mind. The indicative makes the flat real.',
      },
    ],
    concepts: ['g.subjunctive-relative', 'g.relatives'],
    level: 'C1',
  },
  {
    id: 'd.n29',
    situation: 'A plan has gone wrong in the first five minutes and you are being sarcastic about it.',
    options: [
      { es: 'Pues sí que empezamos bien.', en: 'Well, that’s a great start.', natural: true },
      {
        es: 'Qué mal hemos empezado, esto es un desastre.',
        en: 'We’ve started badly, this is a disaster.',
        natural: false,
        note: 'Says the same thing with no irony at all. The point of pues sí que is that the words are positive and the meaning is not.',
      },
    ],
    concepts: ['p.pues-si-que', 'p.vaya-tela'],
    level: 'C1',
  },
  {
    id: 'd.n30',
    situation: 'You want to say a proposal does not really persuade you, without rejecting it outright.',
    options: [
      { es: 'No termina de convencerme.', en: 'It doesn’t quite convince me.', natural: true },
      {
        es: 'No me convence en absoluto.',
        en: 'It doesn’t convince me at all.',
        natural: false,
        note: 'That is a flat rejection. no termina de leaves the door open, which is the whole point of the hedge.',
      },
    ],
    concepts: ['p.no-termina-de', 'p.hasta-cierto-punto'],
    level: 'C1',
  },
  {
    id: 'd.n31',
    situation: 'You want to correct how something has been characterised, without contradicting the speaker.',
    options: [
      { es: 'Más bien es una cuestión de plazos.', en: 'It’s more a question of deadlines.', natural: true },
      {
        es: 'No, es una cuestión de plazos.',
        en: 'No, it’s a question of deadlines.',
        natural: false,
        note: 'The bare no contradicts. más bien adjusts the framing while letting the other person keep theirs.',
      },
    ],
    concepts: ['p.mas-bien', 'v.matizar'],
    level: 'C1',
  },
  {
    id: 'd.n32',
    situation: 'You are complaining formally about a service and want to sound composed rather than furious.',
    options: [
      { es: 'Quisiera dejar constancia de lo ocurrido.', en: 'I’d like to place on record what happened.', natural: true },
      {
        es: 'Estoy muy enfadado y quiero quejarme ahora mismo.',
        en: 'I’m very angry and I want to complain right now.',
        natural: false,
        note: 'Understandable, but it hands the advantage away. Formal Spanish complaints stay cold: quisiera, dejar constancia, lo ocurrido.',
      },
    ],
    concepts: ['p.dejar-constancia', 'g.register'],
    level: 'C1',
  },
  {
    id: 'd.n33',
    situation: 'A colleague keeps talking around the issue and you want them to get to the point — politely.',
    options: [
      { es: 'Perdona que te interrumpa, ¿vamos al grano?', en: 'Sorry to interrupt — shall we get to the point?', natural: true },
      {
        es: 'Estás yéndote por las ramas otra vez.',
        en: 'You’re going off on a tangent again.',
        natural: false,
        note: 'True, and rude. The idiom is accurate but naming someone’s failing directly is much harsher in Spanish than the English sounds.',
      },
    ],
    concepts: ['p.ir-al-grano', 'p.irse-por-las-ramas'],
    level: 'C1',
  },

  // --- C2: near-synonyms, connotation and audience -------------------------
  {
    id: 'd.n34',
    situation: 'A report contains a finding, and you are summarising it neutrally in writing.',
    options: [
      { es: 'El informe señala que las cifras han mejorado.', en: 'The report points out that the figures have improved.', natural: true },
      {
        es: 'El informe alega que las cifras han mejorado.',
        en: 'The report claims that the figures have improved.',
        natural: false,
        note: 'Alegar plants doubt and hints at an excuse. For neutral reporting Spanish uses señalar or indicar.',
      },
    ],
    concepts: ['v.senalar', 'v.alegar'],
    level: 'C2',
  },
  {
    id: 'd.n35',
    situation: 'Someone admits something that does not make them look good.',
    options: [
      { es: 'Reconoció que se había equivocado.', en: 'He acknowledged that he had been wrong.', natural: true },
      {
        es: 'Afirmó que se había equivocado.',
        en: 'He asserted that he had been wrong.',
        natural: false,
        note: 'Afirmar is neutral assertion. Admitting something against your own interest is reconocer — the connotation is the whole difference.',
      },
    ],
    concepts: ['v.reconocer', 'v.afirmar'],
    level: 'C2',
  },
  {
    id: 'd.n36',
    situation: 'You are describing bureaucratic obstacles holding up a project in Spain.',
    options: [
      { es: 'Nos hemos encontrado con muchas trabas administrativas.', en: 'We’ve run into a lot of administrative red tape.', natural: true },
      {
        es: 'Nos hemos encontrado con muchos percances administrativos.',
        en: 'We’ve run into a lot of administrative mishaps.',
        natural: false,
        note: 'A percance is an accidental mishap. Deliberate bureaucratic friction is trabas — the standard Spanish complaint.',
      },
    ],
    concepts: ['v.traba', 'v.percance'],
    level: 'C2',
  },
  {
    id: 'd.n37',
    situation: 'You realise the other person has misunderstood you, and you want to reopen the point without blaming them.',
    options: [
      { es: 'Creo que no me he explicado bien.', en: 'I don’t think I explained myself well.', natural: true },
      {
        es: 'No me has entendido bien.',
        en: 'You haven’t understood me properly.',
        natural: false,
        note: 'Grammatically identical work, socially the opposite. Taking the blame yourself is what actually reopens the conversation.',
      },
    ],
    concepts: ['p.no-me-he-explicado', 'p.me-explico'],
    level: 'C2',
  },
  {
    id: 'd.n38',
    situation: 'A colleague handles a difficult team member without anyone falling out.',
    options: [
      { es: 'Tiene mucha mano izquierda para estas cosas.', en: 'She’s very deft at handling these things.', natural: true },
      {
        es: 'Es muy diplomática con estas cosas.',
        en: 'She’s very diplomatic about these things.',
        natural: false,
        note: 'Not wrong, just flat. mano izquierda is the idiom a Spaniard reaches for, and it praises the skill rather than the manner.',
      },
    ],
    concepts: ['p.tener-mano-izquierda', 'p.salirse-con-la-suya'],
    level: 'C2',
  },
  {
    id: 'd.n39',
    situation: 'You are writing the closing line of a formal argument.',
    options: [
      { es: 'En última instancia, la decisión corresponde al comité.', en: 'Ultimately, the decision rests with the committee.', natural: true },
      {
        es: 'Al final del día, la decisión es del comité.',
        en: 'At the end of the day, the decision is the committee’s.',
        natural: false,
        note: 'Al final del día is a calque of the English idiom that has crept into speech but still jars in formal writing. Spanish has a fin de cuentas for speech and en última instancia for writing.',
      },
    ],
    concepts: ['p.en-ultima-instancia', 'p.a-fin-de-cuentas'],
    level: 'C2',
  },
  {
    id: 'd.n40',
    situation: 'You want to say a policy did not just fail to fix the problem — it made it worse.',
    options: [
      { es: 'Lejos de resolverlo, lo ha agravado.', en: 'Far from solving it, it has made it worse.', natural: true },
      {
        es: 'No lo ha resuelto y además lo ha agravado.',
        en: 'It hasn’t solved it and it has also made it worse.',
        natural: false,
        note: 'Says the facts and loses the rhetoric. lejos de sets up the reversal in three words — that compression is the C2 skill.',
      },
    ],
    concepts: ['p.lejos-de', 'p.no-tanto-como'],
    level: 'C2',
  },
];
