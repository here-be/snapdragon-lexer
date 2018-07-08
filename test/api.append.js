'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.append', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  it('should do nothing when the value is not a string', () => {
    lexer.append();
    lexer.append(null);
    lexer.append(false);
    assert.deepEqual(lexer.state.stash, ['']);
  });

  it('should not push empty strings onto the stash', () => {
    lexer.append('');
    lexer.append('');
    lexer.append('');
    assert.deepEqual(lexer.state.stash, ['']);
  });

  it('should append non-empty strings to the last value on the stash', () => {
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
