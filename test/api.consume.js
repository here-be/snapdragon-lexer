'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.consume', () => {
  beforeEach(() => {
    lexer = new Lexer('abcdefghi');
  });

  it('should remove the given length from lexer.state.string', () => {
    lexer.consume(1);
    assert.equal(lexer.state.string, 'bcdefghi');
    lexer.consume(3);
    assert.equal(lexer.state.string, 'efghi');
    lexer.consume(3);
    assert.equal(lexer.state.string, 'hi');
  });
});
