'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('static.isToken', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should be true when the value is a token', function() {
    assert(Lexer.isToken(lexer.token('foo')));
  });

  it('should be false when the value is not a token', function() {
    assert(!Lexer.isToken());
  });
});
