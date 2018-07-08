'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.error', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  it('should throw an error', () => {
    assert.throws(() => {
      lexer.error(new Error('foo'));
    }, /foo/);
  });

  it('should convert a string to an error', () => {
    assert.throws(() => {
      lexer.error('foo');
    }, /foo/);
  });

  it('should emit an error', function(cb) {
    lexer.on('error', () => cb());
    lexer.error(new Error('foo'));
  });

  it('should not throw an error when listening for error', function(cb) {
    lexer.on('error', () => cb());
    assert.doesNotThrow(() => {
      lexer.error(new Error('foo'));
    });
  });
});
