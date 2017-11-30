'use strict';

require('mocha');
const assert = require('assert');
const define = require('define-property');
const Lexer = require('..');
let lexer;

describe('api.lex', function() {
  beforeEach(function() {
    lexer = new Lexer('//foo/bar.com');
    lexer.on('token', tok => define(tok, 'match', tok.match));
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.capture('dot', /^\./);
  });

  it('should return undefined if the handler does not match a substring', function() {
    assert.equal(typeof lexer.lex('text'), 'undefined');
  });

  it('should return a token if the handler matches a substring', function() {
    assert.deepEqual(lexer.lex('slash'), {type: 'slash', val: '/'});
  });

  it('should update lexer.string', function() {
    assert.equal(lexer.string, '//foo/bar.com');
    assert.deepEqual(lexer.lex('slash'), {type: 'slash', val: '/'});

    assert.equal(lexer.string, '/foo/bar.com');
    assert.deepEqual(lexer.lex('slash'), {type: 'slash', val: '/'});

    assert.equal(lexer.string, 'foo/bar.com');
    assert.deepEqual(lexer.lex('text'), {type: 'text', val: 'foo'});

    assert.equal(lexer.string, '/bar.com');
    assert.deepEqual(lexer.lex('slash'), {type: 'slash', val: '/'});

    assert.equal(lexer.string, 'bar.com');
    assert.deepEqual(lexer.lex('text'), {type: 'text', val: 'bar'});

    assert.equal(lexer.string, '.com');
    assert.deepEqual(lexer.lex('dot'), {type: 'dot', val: '.'});

    assert.equal(lexer.string, 'com');
    assert.deepEqual(lexer.lex('text'), {type: 'text', val: 'com'});

    assert.equal(lexer.string, '');
  });
});
