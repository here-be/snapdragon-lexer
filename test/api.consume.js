'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.consume', function() {
  beforeEach(function() {
    lexer = new Lexer('abcdefghi');
  });

  it('should remove the given length from lexer.string', function() {
    lexer.consume(1);
    assert.equal(lexer.string, 'bcdefghi');
    lexer.consume(3);
    assert.equal(lexer.string, 'efghi');
    lexer.consume(3);
    assert.equal(lexer.string, 'hi');
  });
});
