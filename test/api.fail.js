'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.fail', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  it('should fail when lexer.state.stack is not empty', () => {
    lexer.state.stack.push(lexer.token('brace.open', '{'));
    assert.throws(() => lexer.fail(), /unclosed: "\{"/);
  });

  it('should show token.match[0] in error message, when defined', () => {
    lexer.state.stack.push(lexer.token('brace.open', '{', ['{']));
    assert.throws(() => lexer.fail(), /unclosed: "\{"/);
  });

  it('should fail when lexer.state.string is not empty', () => {
    lexer.state.string = 'foo';
    assert.throws(() => lexer.fail(), /unmatched input: "foo"/);
  });

  it('should not fail when lexer.state.string is empty', () => {
    lexer.state.string = '';
    assert.doesNotThrow(() => lexer.fail());
  });
});
