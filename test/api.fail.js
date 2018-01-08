'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.fail', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should fail when lexer.stack is not empty', function() {
    lexer.stack.push(lexer.token('brace.open', '{'));
    assert.throws(function() {
      lexer.fail();
    }, /unclosed: "\{"/);
  });

  it('should show token.match[0] in error message, when defined', function() {
    lexer.stack.push(lexer.token('brace.open', '{', ['{']));
    assert.throws(function() {
      lexer.fail();
    }, /unclosed: "\{"/);
  });

  it('should fail when lexer.string is not empty', function() {
    lexer.string = 'foo';
    assert.throws(function() {
      lexer.fail();
    }, /unmatched input: "f"/);
  });

  it('should not fail when lexer.string is empty', function() {
    lexer.string = '';
    assert.doesNotThrow(function() {
      lexer.fail();
    });
  });
});
