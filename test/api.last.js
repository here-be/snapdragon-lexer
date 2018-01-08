'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.last', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should return the last value of an array', function() {
    const arr = ['a', 'b', 'c'];
    assert.strictEqual(lexer.last(arr), 'c');
  });

  it('should return undefined when array is empty', function() {
    const arr = [];
    assert.strictEqual(lexer.last(arr), undefined);
  });

  it('should return null when not an array', function() {
    const arr = '';
    assert.strictEqual(lexer.last(arr), null);
  });
});
