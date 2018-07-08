'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.advance', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  it('should advance to the next match and return a token', () => {
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.capture('star', /^\*/);
    lexer.state.string = 'foo/*';

    const tok = lexer.advance();
    assert.equal(tok.value, 'foo');
  });

  it('should consume the matched substring', () => {
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.capture('star', /^\*/);
    lexer.state.string = 'foo/*';
    lexer.advance();

    assert.equal(lexer.state.consumed, 'foo');
    assert.equal(lexer.state.string, '/*');
  });

  it('should fail when a match is not found', () => {
    lexer.state.string = 'foo/*';
    assert.throws(() => lexer.advance(), /unmatched/);
  });

  it('should advance in character mode', () => {
    lexer.options.mode = 'character';
    lexer.state.string = 'foo/*';

    assert.equal(lexer.advance(), 'f');
    assert.equal(lexer.advance(), 'o');
    assert.equal(lexer.advance(), 'o');
    assert.equal(lexer.advance(), '/');
    assert.equal(lexer.advance(), '*');
  });
});
