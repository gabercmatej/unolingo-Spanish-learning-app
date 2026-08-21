/**
 * `global.css` exists for the web build; under jest it is a syntax error.
 *
 * Not in a `__mocks__` directory on purpose — nothing here is a manual mock of
 * a module called "style", it is a stub the moduleNameMapper points stylesheet
 * imports at.
 */
module.exports = {};
