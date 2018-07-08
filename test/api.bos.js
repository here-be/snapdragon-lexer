'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.bos', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  it('should be true when lexer.state.string is empty', () => {
    assert(lexer.bos());
  });

  it('should be false when lexer.state.string is not empty', () => {
    lexer.state.string = 'foo';
    assert(lexer.bos());
  });
});
