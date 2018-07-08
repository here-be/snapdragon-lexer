'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.prev', () => {
  beforeEach(() => {
    lexer = new Lexer();
    lexer.capture('dot', /^\./);
    lexer.capture('star', /^\*/);
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.state.string = '//foo/bar.com';
  });

  it('should get the prev token on the tokens array', () => {
    lexer.tokenize('//foo/bar.com');
    const token = lexer.prev();
    assert(token);
    assert.equal(token.type, 'text');
    assert.equal(token.value, 'com');
  });
});
