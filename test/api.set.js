'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.set', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  it('should set a handler function on lexer.handlers', () => {
    lexer.set('star', () => {});
    assert.equal(typeof lexer.handlers.get('star'), 'function');
  });

  it('should create a noop by default', () => {
    lexer.set('star');
    assert.equal(typeof lexer.handlers.get('star'), 'function');
  });

  it('should call the registered handler function', () => {
    lexer.state.string = '*/';
    lexer.set('star', function() {
      let match = this.match(/^\*/, 'star');
      if (match) {
        return this.token('star', match);
      }
    });

    const tok = lexer.advance();
    assert(tok);
    assert.equal(tok.type, 'star');
    assert.equal(tok.value, '*');
  });

  it('should convert returned objects into Token instances', () => {
    lexer.state.string = '*/';
    lexer.set('star', function() {
      let match = this.match(/^\*/, 'star');
      if (match) {
        return { type: 'star', match };
      }
    });

    const tok = lexer.advance();
    assert(tok);
    assert(Lexer.isToken(tok));
  });

  it('should use handler type to set token.type when not defined', () => {
    lexer.state.string = '*/';
    lexer.set('star', function() {
      let match = this.match(/^\*/, 'star');
      if (match) {
        return { match };
      }
    });

    const tok = lexer.advance();
    assert(tok);
    assert.equal(tok.type, 'star');
    assert(Lexer.isToken(tok));
  });
});
