'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.consume', function() {
  beforeEach(function() {
    lexer = new Lexer('abcdef');
  });

  it('should throw an error when value is not a string', function() {
    assert.throws(() => lexer.consume(3));
  });

  it('should update remove the given chars from lexer.string', function() {
    lexer.consume('abc');
    assert.equal(lexer.string, 'def');
  });
});
