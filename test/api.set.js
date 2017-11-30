'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.set', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should set a handler function on lexer.handlers', function() {
    lexer.set('star', () => {});
    assert.equal(typeof lexer.handlers.star, 'function');
  });

  it('should call the registered handler function', function() {
    lexer.string = '*/';
    lexer.set('star', function() {
      const match = this.match(/^\*/, 'star');
      if (match) {
        return this.token('star', match);
      }
    });

    const tok = lexer.advance();

    assert(tok);
    assert.equal(tok.type, 'star');
    assert.equal(tok.val, '*');
  });
});
