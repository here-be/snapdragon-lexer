'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.peek', () => {
  beforeEach(() => {
    lexer = new Lexer();
    lexer.capture('dot', /^\./);
    lexer.capture('star', /^\*/);
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.state.string = '//foo/bar.com';
  });

  it('should get the next token', () => {
    var tok = lexer.peek();
    assert(tok);
    assert.equal(tok.type, 'slash');
    assert.equal(tok.value, '/');
  });

  it('should consume the captured substring', () => {
    lexer.peek();
    assert.equal(lexer.state.consumed, '/');
  });

  it('should add the captured token to lexer.state.queue', () => {
    var tok = lexer.peek();
    assert.equal(lexer.state.queue.length, 1);
    assert.equal(lexer.state.queue[0], tok);
  });

  it('should not consume more input if a token is enqueued', () => {
    lexer.peek();
    assert.equal(lexer.state.consumed, '/');
    assert.equal(lexer.state.queue.length, 1);

    lexer.peek();
    assert.equal(lexer.state.consumed, '/');
    assert.equal(lexer.state.queue.length, 1);

    lexer.peek();
    assert.equal(lexer.state.consumed, '/');
    assert.equal(lexer.state.queue.length, 1);
  });

  it('should get the next token when lexer.state.queue is empty', () => {
    lexer.peek();
    assert.equal(lexer.state.consumed, '/');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];

    lexer.peek();
    assert.equal(lexer.state.consumed, '//');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];

    lexer.peek();
    assert.equal(lexer.state.consumed, '//foo');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];

    lexer.peek();
    assert.equal(lexer.state.consumed, '//foo/');
    assert.equal(lexer.state.queue.length, 1);
    lexer.state.queue = [];
  });
});
