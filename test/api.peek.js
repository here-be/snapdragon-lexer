'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.peek', function() {
  beforeEach(function() {
    lexer = new Lexer();
    lexer.capture('dot', /^\./);
    lexer.capture('star', /^\*/);
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.string = '//foo/bar.com';
  });

  it('should get the next token', function() {
    var tok = lexer.peek();
    assert(tok);
    assert.equal(tok.type, 'slash');
    assert.equal(tok.value, '/');
  });

  it('should consume the captured substring', function() {
    lexer.peek();
    assert.equal(lexer.consumed, '/');
  });

  it('should add the captured token to lexer.state.queue', function() {
    var tok = lexer.peek();
    assert.equal(lexer.state.queue.length, 1);
    assert.equal(lexer.state.queue[0], tok);
  });

  it('should not consume more input if a token is enqueued', function() {
    lexer.peek();
    assert.equal(lexer.consumed, '/');
    assert.equal(lexer.state.queue.length, 1);

    lexer.peek();
    assert.equal(lexer.consumed, '/');
    assert.equal(lexer.state.queue.length, 1);

    lexer.peek();
    assert.equal(lexer.consumed, '/');
    assert.equal(lexer.state.queue.length, 1);
  });

  it('should get the next token when lexer.state.queue is empty', function() {
    lexer.peek();
    assert.equal(lexer.consumed, '/');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];

    lexer.peek();
    assert.equal(lexer.consumed, '//');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];

    lexer.peek();
    assert.equal(lexer.consumed, '//foo');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];

    lexer.peek();
    assert.equal(lexer.consumed, '//foo/');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];
  });
});
