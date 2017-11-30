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
    assert.throws(function() {
      lexer.lookahead();
    });
  });

  it('should get the next "n" tokens and return the last one', function() {
    var tok = lexer.lookahead(3);
    assert(tok);
    assert.equal(tok.type, 'text');
    assert.equal(tok.val, 'foo');
  });

  it('should consume the captured substring', function() {
    lexer.lookahead(3);
    assert.equal(lexer.consumed, '//foo');
  });

  it('should add the captured tokens to lexer.queue', function() {
    var tok = lexer.lookahead(3);
    assert.equal(lexer.queue.length, 3);
    assert.equal(lexer.queue[2], tok);
  });

  it('should use enqueued tokens before capturing more', function() {
    lexer.lookahead(3);
    assert.equal(lexer.consumed, '//foo');
    assert.equal(lexer.queue.length, 3);

    lexer.lookahead(4);
    assert.equal(lexer.consumed, '//foo/');
    assert.equal(lexer.queue.length, 4);
  });

  it('should get the next token when lexer.queue is empty', function() {
    lexer.lookahead(1);
    assert.equal(lexer.consumed, '/');
    assert.equal(lexer.queue.length, 1);
    lexer.queue = [];

    lexer.lookahead(1);
    assert.equal(lexer.consumed, '//');
    assert.equal(lexer.queue.length, 1);
    lexer.queue = [];

    lexer.lookahead(1);
    assert.equal(lexer.consumed, '//foo');
    assert.equal(lexer.queue.length, 1);
    lexer.queue = [];

    lexer.lookahead(1);
    assert.equal(lexer.consumed, '//foo/');
    assert.equal(lexer.queue.length, 1);
    lexer.queue = [];
  });
});
