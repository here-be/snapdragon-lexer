'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.advance', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should advance to the next match and return a token', function() {
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.capture('star', /^\*/);
    lexer.string = 'foo/*';

    const tok = lexer.advance();
    assert.equal(tok.value, 'foo');
  });

  it('should consume the matched substring', function() {
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.capture('star', /^\*/);
    lexer.string = 'foo/*';
    lexer.advance();

    assert.equal(lexer.consumed, 'foo');
    assert.equal(lexer.string, '/*');
  });

  it('should fail when a match is not found', function() {
    lexer.string = 'foo/*';
    assert.throws(function() {
      lexer.advance();
    }, /unmatched/);
  });

  it('should advance in character mode', function() {
    lexer.options.mode = 'character';
    lexer.string = 'foo/*';

    assert.equal(lexer.advance(), 'f');
    assert.equal(lexer.advance(), 'o');
    assert.equal(lexer.advance(), 'o');
    assert.equal(lexer.advance(), '/');
    assert.equal(lexer.advance(), '*');
  });
});
