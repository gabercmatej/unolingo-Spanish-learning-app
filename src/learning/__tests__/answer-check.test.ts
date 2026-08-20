import { accentCarriesMeaning } from '@/content/accent-pairs';
import { checkAnswer, deaccent, levenshtein, normalize, pronounAgrees } from '@/learning/answer-check';
import { practiceText } from '@/learning/generator';
import { gradeFor, verdictFor } from '@/learning/grading';

describe('normalize', () => {
  it('strips case, punctuation and Spanish question marks', () => {
    expect(normalize('¿Cómo estás?')).toBe('cómo estás');
    expect(normalize('  ¡Hola,   mundo!  ')).toBe('hola mundo');
  });

  it('expands English contractions so both forms are accepted', () => {
    expect(normalize("I'm hungry", 'en')).toBe('i am hungry');
    expect(normalize("I don't know", 'en')).toBe('i do not know');
  });
});

describe('deaccent', () => {
  it('folds accents and ñ', () => {
    expect(deaccent('cómo estás')).toBe('como estas');
    expect(deaccent('español')).toBe('espanol');
  });
});

describe('levenshtein', () => {
  it('measures edit distance', () => {
    expect(levenshtein('gato', 'gato')).toBe(0);
    expect(levenshtein('gato', 'gata')).toBe(1);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });
});

describe('checkAnswer', () => {
  it('accepts an exact match', () => {
    expect(checkAnswer('Tengo un perro.', ['Tengo un perro.']).grade).toBe('correct');
  });

  it('ignores case and punctuation differences', () => {
    expect(checkAnswer('tengo un perro', ['Tengo un perro.']).grade).toBe('correct');
  });

  it('accepts a missing accent but names it', () => {
    const result = checkAnswer('como estas', ['¿Cómo estás?']);
    expect(result.grade).toBe('correct');
    expect(result.note).toContain('accents');
  });

  it('downgrades missing accents to "almost" under strict checking', () => {
    const result = checkAnswer('como estas', ['¿Cómo estás?'], { formIsTarget: true });
    expect(result.grade).toBe('almost');
  });

  it('treats a single typo as "almost", not wrong', () => {
    const result = checkAnswer('Tengo un pero', ['Tengo un perro']);
    expect(result.grade).toBe('almost');
    expect(result.best).toBe('Tengo un perro');
  });

  it('accepts any of several valid translations', () => {
    const accepted = ['Voy a comer ahora.', 'Ahora voy a comer.'];
    expect(checkAnswer('Ahora voy a comer', accepted).grade).toBe('correct');
    expect(checkAnswer('Voy a comer ahora', accepted).grade).toBe('correct');
  });

  it('accepts an added subject pronoun that agrees with the verb', () => {
    expect(checkAnswer('Yo tengo un perro', ['Tengo un perro']).grade).toBe('correct');
    expect(checkAnswer('Nosotros comemos a las dos', ['Comemos a las dos']).grade).toBe('correct');
  });

  it('rejects a subject pronoun that disagrees with the verb', () => {
    // "tú tengo" is a person error and must not be silently accepted.
    expect(checkAnswer('Tú tengo un perro', ['Tengo un perro']).grade).not.toBe('correct');
  });

  it('accepts dropping an authored subject pronoun', () => {
    expect(checkAnswer('Soy esloveno', ['Yo soy esloveno']).grade).toBe('correct');
  });

  it('rejects an empty answer', () => {
    expect(checkAnswer('   ', ['Tengo un perro']).grade).toBe('incorrect');
  });

  it('rejects a genuinely different sentence', () => {
    expect(checkAnswer('Quiero un café', ['Tengo un perro']).grade).toBe('incorrect');
  });

  it('checks English answers with contraction tolerance', () => {
    const result = checkAnswer("I'm tired", ['I am tired'], { language: 'en' });
    expect(result.grade).toBe('correct');
  });

  it('reports a classification alongside the grade', () => {
    const exact = checkAnswer('Tengo un perro.', ['Tengo un perro.']);
    expect(exact.error).toBe('none');
    expect(exact.verdict).toBe('correct');

    const wrong = checkAnswer('Tengo un gato', ['Tengo un perro']);
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.grade).toBe('incorrect');
  });

  it('derives the grade from the error rather than deciding it twice', () => {
    const result = checkAnswer('Tengo un pero', ['Tengo un perro']);
    expect(result.error).toBe('spelling');
    expect(result.grade).toBe(gradeFor(result.error));
    expect(result.verdict).toBe(verdictFor(result.error));
  });
});

describe('pronounAgrees', () => {
  it('matches regular endings to persons', () => {
    expect(pronounAgrees('yo', 'hablo')).toBe(true);
    expect(pronounAgrees('tu', 'hablas')).toBe(true);
    expect(pronounAgrees('nosotros', 'hablamos')).toBe(true);
    expect(pronounAgrees('vosotros', 'habláis')).toBe(true);
    expect(pronounAgrees('ellos', 'hablan')).toBe(true);
  });

  it('rejects mismatches', () => {
    expect(pronounAgrees('tu', 'hablo')).toBe(false);
    expect(pronounAgrees('yo', 'hablas')).toBe(false);
  });

  it('knows the common irregulars', () => {
    expect(pronounAgrees('yo', 'soy')).toBe(true);
    expect(pronounAgrees('el', 'es')).toBe(true);
    expect(pronounAgrees('yo', 'es')).toBe(false);
  });

  it('does not guess when a reflexive pronoun hides the verb', () => {
    expect(pronounAgrees('yo', 'me')).toBe(true);
  });
});

describe('English comprehension leniency', () => {
  it('accepts a different but equivalent English phrasing', () => {
    // The reported case: translating "Muy bien, ¿y tú?"
    expect(checkAnswer('Very good and you?', ['Very well, and you?'], { language: 'en' }).grade).toBe(
      'correct',
    );
  });

  it('accepts synonyms and dropped articles', () => {
    expect(checkAnswer('Hi, how are you?', ['Hello, how are you?'], { language: 'en' }).grade).toBe('correct');
    expect(checkAnswer('I like films', ['I like movies'], { language: 'en' }).grade).toBe('correct');
    expect(checkAnswer('I have dog', ['I have a dog'], { language: 'en' }).grade).toBe('correct');
  });

  it('accepts a different word order', () => {
    expect(
      checkAnswer('In the morning I work', ['I work in the morning'], { language: 'en' }).grade,
    ).toBe('correct');
  });

  it('still rejects a genuinely different meaning', () => {
    expect(checkAnswer('Very bad, and you?', ['Very well, and you?'], { language: 'en' }).grade).toBe(
      'incorrect',
    );
    expect(checkAnswer('I have a cat', ['I have a dog'], { language: 'en' }).grade).toBe('incorrect');
    expect(checkAnswer('She works in the morning', ['I work in the morning'], { language: 'en' }).grade).toBe(
      'incorrect',
    );
  });

  it('does not loosen Spanish answers, where the exact form is the lesson', () => {
    // Word-salad with the right content words must not pass in Spanish.
    expect(checkAnswer('perro un tengo', ['Tengo un perro'], { language: 'es' }).grade).toBe(
      'incorrect',
    );
  });
});

/**
 * The torture pass.
 *
 * These are the cases that were measured against the real checker before the
 * word-alignment rule existed. Nineteen of fifty adversarial answers came back
 * "almost" — which is worth 0.75 of a correct answer *and* lengthens the review
 * interval, so every one of them taught the mistake and then hid it for longer.
 * The cause was a typo tolerance that measured edit distance across the whole
 * sentence: two characters of slack on anything long, when every grammatical
 * error in Spanish is one or two characters.
 *
 * Each `it` below is one class of that failure. They are written as pairs —
 * the error that must fail beside the slip that must still be forgiven —
 * because a checker can be made to pass either half alone by simply moving the
 * threshold, and only the pair pins the actual rule.
 */
describe('meaning errors are not typos', () => {
  const wrong = (given: string, ...accepted: string[]) =>
    expect(checkAnswer(given, accepted).grade).toBe('incorrect');

  it('rejects the wrong person', () => {
    wrong('yo habla español', 'yo hablo español');
    wrong('Ella come pan', 'Ella comes pan');
    wrong('Nosotros habla', 'Nosotros hablamos');
  });

  it('rejects the wrong tense', () => {
    wrong('Nosotros hablamos', 'Nosotros hablaremos');
    wrong('Yo he comido', 'Yo había comido');
    wrong('comí la paella', 'comió la paella');
  });

  it('rejects the wrong auxiliary', () => {
    wrong('hemos comido', 'han comido');
    wrong('Han comido paella', 'Hemos comido paella');
  });

  it('rejects ser for estar', () => {
    wrong('Soy cansado', 'Estoy cansado');
    wrong('Es aburrido', 'Está aburrido');
    wrong('El café es frío', 'El café está frío');
  });

  it('rejects por for para', () => {
    wrong('Gracias para la comida', 'Gracias por la comida');
    wrong('Salgo para Madrid', 'Salgo por Madrid');
  });

  it('rejects gender and number disagreement', () => {
    wrong('la problema', 'el problema');
    wrong('El casa es grande', 'La casa es grande');
    wrong('Los libros rojo', 'Los libros rojos');
    wrong('una coche rojo', 'un coche rojo');
  });

  it('rejects the wrong object or reflexive pronoun', () => {
    wrong('Me levanto temprano', 'Se levanta temprano');
    wrong('Lo veo', 'La veo');
    wrong('Te quiero', 'Le quiero');
  });

  it('rejects the indicative where the subjunctive changes the meaning', () => {
    wrong('Espero que viene', 'Espero que venga');
    wrong('Quiero que hablas', 'Quiero que hables');
  });

  it('rejects grammatical Spanish that does not answer the prompt', () => {
    wrong('Me llamo Matej', 'Tengo veinte años');
    wrong('Hace mucho calor hoy', 'Vivo en Madrid');
  });

  it('rejects a missing or an added word', () => {
    wrong('Tengo perro', 'Tengo un perro');
    wrong('Tengo un perro grande', 'Tengo un perro');
  });

  it('rejects two slips in one answer — one is a typo, two is not knowing it', () => {
    wrong('Tengo un pero negrp', 'Tengo un perro negro');
  });
});

describe('slips of the finger are still forgiven', () => {
  const almost = (given: string, accepted: string) =>
    expect(checkAnswer(given, [accepted]).grade).toBe('almost');

  it('accepts one mis-keyed letter inside a word', () => {
    // Every one of these differs by a single character, exactly like the
    // grammar errors above. What separates them is *where*: Spanish inflection
    // lives on the last two letters, so an edit before them is a slip.
    almost('Tengo un pero', 'Tengo un perro');
    almost('Voy a la bibloteca', 'Voy a la biblioteca');
    almost('Es un restaurente bueno', 'Es un restaurante bueno');
    almost('Quiero un bocadilo', 'Quiero un bocadillo');
    almost('Vivo en Barcelna', 'Vivo en Barcelona');
    almost('El ordendor no funciona', 'El ordenador no funciona');
  });

  it('still waves a missing accent through, which is a keyboard, not an error', () => {
    const correct = (given: string, accepted: string) =>
      expect(checkAnswer(given, [accepted]).grade).toBe('correct');
    correct('Quiero un cafe', 'Quiero un café');
    // 'El nino esta en el jardin' moved to "accents mean different things in
    // different tasks" below: esta/está is a genuine minimal pair (this vs.
    // is), so with the real accentCarriesMeaning predicate injected it grades
    // "almost", not "correct". This block only injects no predicate, so it
    // keeps the words this feature must never flag.
    correct('Cuantos anos tienes', '¿Cuántos años tienes?');
    correct('Vosotros comeis', 'Vosotros coméis');
  });
});

describe('accents mean different things in different tasks', () => {
  const real = { accentCarriesMeaning };

  it('waves through an accent that distinguishes nothing', () => {
    // A phone keyboard, not an error. Full credit, with the spelling taught.
    for (const [given, expected] of [
      ['Quiero un cafe', 'Quiero un café'],
      ['El nino juega en el jardin', 'El niño juega en el jardín'],
      ['Cuantos anos tienes', '¿Cuántos años tienes?'],
      ['Vosotros comeis', 'Vosotros coméis'],
    ]) {
      const result = checkAnswer(given, [expected], real);
      expect(result.error).toBe('accent');
      expect(result.grade).toBe('correct');
      expect(result.note).toBeTruthy();
    }
  });

  it('flags an accent that changes which word it is, in free production', () => {
    // esta/está and como/cómo are different words. Still retrieval — the
    // learner produced the sentence — but not silent full credit.
    const result = checkAnswer('El nino esta en el jardin', ['El niño está en el jardín'], real);
    expect(result.error).toBe('accentContrast');
    expect(result.grade).toBe('almost');
  });

  it('fails it outright when the form is the thing being tested', () => {
    // A conjugation drill asking for the preterite. hablo is a real word and
    // the wrong one, so this is a form error, not an orthography note.
    const result = checkAnswer('hablo', ['habló'], { ...real, formIsTarget: true });
    expect(result.error).toBe('form');
    expect(result.grade).toBe('incorrect');
  });

  it('still forgives an innocent accent inside a form-testing task', () => {
    // Getting the conjugation right and the noun's accent wrong is not a
    // conjugation error.
    const result = checkAnswer('Bebo cafe', ['Bebo café'], { ...real, formIsTarget: true });
    expect(result.grade).not.toBe('incorrect');
  });

  it('stays permissive when no predicate is injected', () => {
    // The pure function cannot know the corpus, and defaults to not
    // distinguishing — the seam eligibility.ts uses for undefined knowledge.
    expect(checkAnswer('El nino esta en el jardin', ['El niño está en el jardín']).grade).toBe(
      'correct',
    );
  });
});

describe('Spanish punctuation is taught, not silently ignored', () => {
  it('accepts a missing opening mark and says so', () => {
    const result = checkAnswer('Cómo estás?', ['¿Cómo estás?']);
    expect(result.error).toBe('punctuation');
    expect(result.grade).toBe('correct');
    expect(result.note).toContain('¿');
  });

  it('says nothing when the punctuation was right', () => {
    expect(checkAnswer('¿Cómo estás?', ['¿Cómo estás?']).error).toBe('none');
  });

  it('does not complain about punctuation the answer never needed', () => {
    expect(checkAnswer('Tengo un perro', ['Tengo un perro.']).error).toBe('none');
  });

  it('never lets a punctuation note outrank a real error', () => {
    // Wrong word AND missing marks: the wrong word is what matters.
    expect(checkAnswer('Como estas tu?', ['¿Cómo está usted?']).verdict).toBe('incorrect');
  });
});

describe('English meaning reversals', () => {
  const wrong = (given: string, accepted: string) =>
    expect(checkAnswer(given, [accepted], { language: 'en' }).grade).toBe('incorrect');

  it('never lets negation slide', () => {
    wrong("I don't like coffee", 'I like coffee');
    wrong('He is not coming', 'He is coming');
    wrong('I cannot go', 'I can go');
    wrong('I never eat meat', 'I always eat meat');
    wrong('Nobody came', 'Everybody came');
    wrong('I have no money', 'I have money');
    wrong('She does not work here', 'She works here');
  });
});

/**
 * Dialogue dashes are typography, not language.
 *
 * A word bank built from "¿Cómo estás? — Muy bien, gracias." handed the learner
 * a bare "—" tile to place, and a typed translation appeared to demand it. The
 * grader never checked it — `normalize` has always stripped it — so the app was
 * asking for a keystroke it then ignored.
 */
describe('dialogue dashes', () => {
  it('are already ignored by the grader, in both directions', () => {
    const accepted = ['¿Cómo estás? — Muy bien, gracias.'];
    expect(checkAnswer('¿Cómo estás? Muy bien, gracias.', accepted).grade).toBe('correct');
    expect(checkAnswer('Cómo estás — Muy bien gracias', accepted).grade).toBe('correct');
  });

  it('are not part of what a word bank asks the learner to assemble', () => {
    const built = practiceText('—¿Qué te pasa? —Nada, que me duele un poco la cabeza.');
    expect(built).not.toMatch(/[—–]/);
    expect(built.startsWith('¿Qué')).toBe(true);
    // The words themselves survive intact — this strips punctuation, not text.
    expect(built).toContain('Nada, que me duele un poco la cabeza.');
  });

  it('leaves a sentence with no dashes exactly as it was', () => {
    const plain = 'Todos mis amigos viven en Barcelona.';
    expect(practiceText(plain)).toBe(plain);
  });
});
