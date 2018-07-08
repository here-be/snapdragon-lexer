'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('lexer', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  it('should set and get state.options', () => {
    lexer.options = { foo: 'bar' };
    assert.equal(lexer.options.foo, 'bar');
    assert.equal(lexer.options.foo, 'bar');
  });

  it('should set state.string', () => {
    lexer.state.string = 'foo';
    assert.equal(lexer.state.string, 'foo');
    assert.equal(lexer.state.string, 'foo');
  });

  it('should set state.input', () => {
    lexer.state.input = 'foo';
    assert.equal(lexer.state.input, 'foo');
    assert.equal(lexer.state.input, 'foo');
  });

  it('should set state.consumed', () => {
    lexer.state.consumed = 'foo';
    assert.equal(lexer.state.consumed, 'foo');
    assert.equal(lexer.state.consumed, 'foo');
  });
});
