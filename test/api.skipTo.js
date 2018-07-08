'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.skipTo', () => {
  beforeEach(() => {
    lexer = new Lexer('//foo/bar.com')
      .capture('dot', /^\./)
      .capture('star', /^\*/)
      .capture('slash', /^\//)
      .capture('text', /^\w+/);
  });

  it('should skip to the specified type', () => {
    const tokens = lexer.skipTo('dot');
    assert.equal(tokens.pop().type, 'dot');
    assert.equal(lexer.state.string, 'com');
  });
});
