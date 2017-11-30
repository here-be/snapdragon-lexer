'use strict';

require('mocha');
const assert = require('assert');
const define = require('define-property');
const Lexer = require('..');
let lexer;

describe('api.scan', function() {
  beforeEach(function() {
    lexer = new Lexer();
    lexer.string = '//foo/bar.com';
    lexer.on('token', tok => define(tok, 'match', tok.match));
  });

  it('should get the next token from the given regex', function() {
    assert.deepEqual(lexer.scan(/^\//, 'slash'), { type: 'slash', val: '/' });
    assert.deepEqual(lexer.scan(/^\//, 'slash'), { type: 'slash', val: '/' });
    assert.deepEqual(lexer.scan(/^\w+/, 'text'), { type: 'text', val: 'foo' });
    assert.deepEqual(lexer.scan(/^\//, 'slash'), { type: 'slash', val: '/' });
    assert.deepEqual(lexer.scan(/^\w+/, 'text'), { type: 'text', val: 'bar' });
    assert.deepEqual(lexer.scan(/^\./, 'dot'), { type: 'dot', val: '.' });
    assert.deepEqual(lexer.scan(/^\w+/, 'text'), { type: 'text', val: 'com' });
  });

  it('should emit "scan"', function() {
    var count = 0;
    var expected = [
      { type: 'slash', val: '/' },
      { type: 'slash', val: '/' },
      { type: 'text', val: 'foo' },
      { type: 'slash', val: '/' },
      { type: 'text', val: 'bar' },
      { type: 'dot', val: '.' },
      { type: 'text', val: 'com' }
    ];

    lexer.on('scan', function(tok) {
      assert.deepEqual(expected[count++], tok);
    });

    lexer.scan(/^\//, 'slash');
    lexer.scan(/^\//, 'slash');
    lexer.scan(/^\w+/, 'text');
    lexer.scan(/^\//, 'slash');
    lexer.scan(/^\w+/, 'text');
    lexer.scan(/^\./, 'dot');
    lexer.scan(/^\w+/, 'text');

    assert.equal(count, expected.length);
  });
});
