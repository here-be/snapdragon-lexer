'use strict';

require('mocha');
const assert = require('assert');
const define = require('define-property');
const Lexer = require('..');
let lexer;

describe('api.scan', () => {
  beforeEach(() => {
    lexer = new Lexer();
    lexer.state.string = '//foo/bar.com';
    lexer.on('token', tok => define(tok, 'match', tok.match));
  });

  it('should throw when regex matches an empty string', () => {
    assert.throws(() => lexer.scan(/^(?=.)/, 'foo'), /empty/);
  });

  it('should add type to error object', function(cb) {
    try {
      lexer.scan(/^(?=.)/, 'foo');
    } catch (err) {
      assert.equal(err.type, 'foo');
      cb();
    }
  });

  it('should get the next token from the given regex', () => {
    assert.deepEqual(lexer.scan(/^\//, 'slash'), { type: 'slash', value: '/' });
    assert.deepEqual(lexer.scan(/^\//, 'slash'), { type: 'slash', value: '/' });
    assert.deepEqual(lexer.scan(/^\w+/, 'text'), { type: 'text', value: 'foo' });
    assert.deepEqual(lexer.scan(/^\//, 'slash'), { type: 'slash', value: '/' });
    assert.deepEqual(lexer.scan(/^\w+/, 'text'), { type: 'text', value: 'bar' });
    assert.deepEqual(lexer.scan(/^\./, 'dot'), { type: 'dot', value: '.' });
    assert.deepEqual(lexer.scan(/^\w+/, 'text'), { type: 'text', value: 'com' });
  });

  it('should emit "scan"', () => {
    var count = 0;
    var expected = [
      { type: 'slash', value: '/' },
      { type: 'slash', value: '/' },
      { type: 'text', value: 'foo' },
      { type: 'slash', value: '/' },
      { type: 'text', value: 'bar' },
      { type: 'dot', value: '.' },
      { type: 'text', value: 'com' }
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
