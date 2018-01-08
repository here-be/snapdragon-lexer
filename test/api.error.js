'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.error', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should throw an error', function() {
    assert.throws(function() {
      lexer.error(new Error('foo'));
    }, /foo/);
  });

  it('should convert a string to an error', function() {
    assert.throws(function() {
      lexer.error('foo');
    }, /foo/);
  });

  it('should emit an error', function(cb) {
    lexer.on('error', () => cb());
    lexer.error(new Error('foo'));
  });

  it('should not throw an error when listening for error', function(cb) {
    lexer.on('error', () => cb());
    assert.doesNotThrow(function() {
      lexer.error(new Error('foo'));
    });
  });
});
