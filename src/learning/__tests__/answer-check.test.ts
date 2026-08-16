import { checkAnswer, deaccent, levenshtein, normalize, pronounAgrees } from '@/learning/answer-check';

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
    const result = checkAnswer('como estas', ['¿Cómo estás?'], { strictAccents: true });
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
