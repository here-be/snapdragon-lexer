'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('Lexer static methods', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  it('should be true if value is an instance of Lexer', () => {
    assert(Lexer.isLexer(lexer));
  });

  it('should expose State class', () => {
    assert(typeof Lexer.State === 'function');
  });
});
