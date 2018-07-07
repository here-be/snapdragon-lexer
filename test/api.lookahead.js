'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.lookahead', function() {
  beforeEach(function() {
    lexer = new Lexer();
    lexer.capture('dot', /^\./);
    lexer.capture('star', /^\*/);
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.string = '//foo/bar.com';
  });

  it('should throw an error when the first argument is not a number', function() {
    assert.throws(() => lexer.lookahead(), /expected/);
  });

  it('should get the next "n" tokens and return the last one', function() {
    var tok = lexer.lookahead(3);
    assert(tok);
    assert.equal(tok.type, 'text');
    assert.equal(tok.value, 'foo');
  });

  it('should consume the captured substring', function() {
    lexer.lookahead(3);
    assert.equal(lexer.consumed, '//foo');
  });

  it('should add the captured tokens to lexer.state.queue', function() {
    var tok = lexer.lookahead(3);
    assert.equal(lexer.state.queue.length, 3);
    assert.equal(lexer.state.queue[2], tok);
  });

  it('should use enqueued tokens before capturing more', function() {
    lexer.lookahead(3);
    assert.equal(lexer.consumed, '//foo');
    assert.equal(lexer.state.queue.length, 3);

    lexer.lookahead(4);
    assert.equal(lexer.consumed, '//foo/');
    assert.equal(lexer.state.queue.length, 4);
  });

  it('should get the next token when lexer.state.queue is empty', function() {
    lexer.lookahead(1);
    assert.equal(lexer.consumed, '/');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];

    lexer.lookahead(1);
    assert.equal(lexer.consumed, '//');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];

    lexer.lookahead(1);
    assert.equal(lexer.consumed, '//foo');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];

    lexer.lookahead(1);
    assert.equal(lexer.consumed, '//foo/');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];
  });
});
