const Posting = require('../src/posting');
const assert = require('assertive');

describe('Posting', () => {
  it('detects no dogs', () => {
    const p = new Posting('1234', 'New Place', 'blah no Dogs');
    assert.expect(p.isNoDogs());
  });

  it('detects no pets', () => {
    const p = new Posting('1234', 'New Place', 'blah No Pets!!! really');
    assert.expect(p.isNoDogs());
  });

  it('detects no mention of pets', () => {
    const p = new Posting('1234', 'New Place', 'the thing that must not be named!');
    assert.falsey(p.isNoDogs());
  })
})
