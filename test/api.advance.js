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
    assert.equal(tok.val, 'foo');
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
});
