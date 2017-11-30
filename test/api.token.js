'use strict';

require('mocha');
const assert = require('assert');
const position = require('snapdragon-position');
const Lexer = require('..');
let lexer;

describe('api.token', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should return an instance of lexer.Token', function() {
    assert(lexer.token('foo') instanceof lexer.Token);
  });

  it('should emit "token"', function() {
    let tokens = [];

    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.capture('star', /^\*/);
    lexer.on('token', (tok) => tokens.push(tok));

    lexer.tokenize('a/*/b');
    assert.equal(tokens.length, 5);
  });
});
