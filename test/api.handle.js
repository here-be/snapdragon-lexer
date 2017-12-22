'use strict';

require('mocha');
const assert = require('assert');
const define = require('define-property');
const Lexer = require('..');
let lexer;

describe('api.handle', function() {
  beforeEach(function() {
    lexer = new Lexer('//foo/bar.com');
    lexer.on('token', tok => define(tok, 'match', tok.match));
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.capture('dot', /^\./);
  });

  it('should return undefined if the handler does not match a substring', function() {
    assert.equal(typeof lexer.handle('text'), 'undefined');
  });

  it('should return a token if the handler matches a substring', function() {
    assert.deepEqual(lexer.handle('slash'), {type: 'slash', value: '/'});
  });

  it('should update lexer.string', function() {
    assert.equal(lexer.string, '//foo/bar.com');
    assert.deepEqual(lexer.handle('slash'), {type: 'slash', value: '/'});

    assert.equal(lexer.string, '/foo/bar.com');
    assert.deepEqual(lexer.handle('slash'), {type: 'slash', value: '/'});

    assert.equal(lexer.string, 'foo/bar.com');
    assert.deepEqual(lexer.handle('text'), {type: 'text', value: 'foo'});

    assert.equal(lexer.string, '/bar.com');
    assert.deepEqual(lexer.handle('slash'), {type: 'slash', value: '/'});

    assert.equal(lexer.string, 'bar.com');
    assert.deepEqual(lexer.handle('text'), {type: 'text', value: 'bar'});

    assert.equal(lexer.string, '.com');
    assert.deepEqual(lexer.handle('dot'), {type: 'dot', value: '.'});

    assert.equal(lexer.string, 'com');
    assert.deepEqual(lexer.handle('text'), {type: 'text', value: 'com'});

    assert.equal(lexer.string, '');
  });
});
