import { EN_EQUIVALENCES } from '@/content/equivalences';
import { COVERAGE_THRESHOLD, contentWords, meaningCoverage, polarity } from '@/learning/meaning';

describe('contentWords', () => {
  it('drops the words that carry no meaning for a comprehension check', () => {
    expect(contentWords('the coffee is on a table')).toEqual(contentWords('coffee on table'));
  });

  it('folds a class member onto its representative when given equivalences', () => {
    expect(contentWords('very well', EN_EQUIVALENCES)).toEqual(
      contentWords('very good', EN_EQUIVALENCES),
    );
  });

  it('leaves words alone when no equivalences are supplied', () => {
    expect(contentWords('very well')).not.toEqual(contentWords('very good'));
  });
});

describe('polarity', () => {
  it('counts the words that reverse a sentence', () => {
    expect(polarity(['i', 'do', 'not', 'like', 'coffee'])).toBe(1);
    expect(polarity(['i', 'like', 'coffee'])).toBe(0);
    expect(polarity(['nobody', 'never', 'goes'])).toBe(2);
  });
});

describe('meaningCoverage', () => {
  it('scores 1 for the model against itself', () => {
    const model = 'no es que dude de su sistema es que el servicio sigue sin funcionar';
    expect(meaningCoverage(model, model)).toBe(1);
  });

  it('scores high for a learner saying the same thing in their own words', () => {
    const model = 'de acuerdo siempre y cuando esta vez se resuelva de verdad';
    const given = 'vale siempre y cuando se resuelva esta vez';
    expect(meaningCoverage(given, model)).toBeGreaterThanOrEqual(COVERAGE_THRESHOLD);
  });

  it('scores 0 when the polarity is reversed, whatever else matches', () => {
    // Every content word matches. Only the negation differs, and it is the
    // only word that matters.
    expect(meaningCoverage('me gusta el cafe', 'no me gusta el cafe')).toBe(0);
    expect(meaningCoverage('no me gusta el cafe', 'me gusta el cafe')).toBe(0);
  });

  it('scores low for a different sentence about a different thing', () => {
    const model = 'quiero reservar una mesa para dos personas';
    expect(meaningCoverage('donde esta la estacion de tren', model)).toBeLessThan(
      COVERAGE_THRESHOLD,
    );
  });

  it('does not reward padding — extra content is not free', () => {
    const model = 'quiero un cafe';
    const padded = 'quiero un cafe y una tostada y un zumo y el periodico y la cuenta';
    expect(meaningCoverage(padded, model)).toBeLessThan(1);
  });

  it('returns 0 for an empty answer', () => {
    expect(meaningCoverage('', 'quiero un cafe')).toBe(0);
  });
});
