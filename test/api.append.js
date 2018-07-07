'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.append', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should do nothing when the value is not a string', function() {
    lexer.append();
    lexer.append(null);
    lexer.append(false);
    assert.deepEqual(lexer.state.stash, ['']);
  });

  it('should not push empty strings onto the stash', function() {
    lexer.append('');
    lexer.append('');
    lexer.append('');
    assert.deepEqual(lexer.state.stash, ['']);
  });

  it('should append non-empty strings to the last value on the stash', function() {
    lexer.append('foo');
    lexer.append('');
    lexer.append('/');
    lexer.append('');
    lexer.append('*');
    lexer.append('.');
    lexer.append('js');
    assert.deepEqual(lexer.state.stash, ['foo', '/', '*', '.', 'js']);
  });
});
