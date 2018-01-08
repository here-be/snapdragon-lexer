'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.eos', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should be true when lexer.string is empty', function() {
    assert(lexer.eos());
  });

  it('should be false when lexer.string is not empty', function() {
    lexer.string = 'foo';
    assert(!lexer.eos());
  });
});
