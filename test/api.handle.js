'use strict';

require('mocha');
const assert = require('assert');
const define = require('define-property');
const Lexer = require('..');
let lexer;

describe('api.handle', () => {
  beforeEach(() => {
    lexer = new Lexer('//foo/bar.com');
    lexer.on('token', tok => define(tok, 'match', tok.match));
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.capture('dot', /^\./);
  });

  it('should return undefined if the handler does not match a substring', () => {
    assert.equal(typeof lexer.handle('text'), 'undefined');
  });

  it('should return a token if the handler matches a substring', () => {
    assert.deepEqual(lexer.handle('slash'), { type: 'slash', value: '/' });
  });

  it('should return a string when options.mode is "character"', () => {
    lexer = new Lexer('abcd', { mode: 'character' });
    lexer.capture('text', /^\w/);
    lexer.lex();
    assert.deepEqual(lexer.state.tokens, ['a', 'b', 'c', 'd']);
  });

  it('should update lexer.state.string', () => {
    assert.equal(lexer.state.string, '//foo/bar.com');
    assert.deepEqual(lexer.handle('slash'), { type: 'slash', value: '/' });

    assert.equal(lexer.state.string, '/foo/bar.com');
    assert.deepEqual(lexer.handle('slash'), { type: 'slash', value: '/' });

    assert.equal(lexer.state.string, 'foo/bar.com');
    assert.deepEqual(lexer.handle('text'), { type: 'text', value: 'foo' });

    assert.equal(lexer.state.string, '/bar.com');
    assert.deepEqual(lexer.handle('slash'), { type: 'slash', value: '/' });

    assert.equal(lexer.state.string, 'bar.com');
    assert.deepEqual(lexer.handle('text'), { type: 'text', value: 'bar' });

    assert.equal(lexer.state.string, '.com');
    assert.deepEqual(lexer.handle('dot'), { type: 'dot', value: '.' });

    assert.equal(lexer.state.string, 'com');
    assert.deepEqual(lexer.handle('text'), { type: 'text', value: 'com' });

    assert.equal(lexer.state.string, '');
  });
});
