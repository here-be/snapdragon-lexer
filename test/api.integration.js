'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.integration', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should register a handler when a function is not passed', function() {
    lexer.capture('text', /^\w+/);
    lexer.capture('star', /^\*/);

    assert.equal(typeof lexer.handlers.text, 'function');
    assert.equal(typeof lexer.handlers.star, 'function');
  });

  it('should register a handler when a function is passed', function() {
    lexer.capture('text', /^\w+/, function() {});
    lexer.capture('star', /^\*/, function() {});

    assert.equal(typeof lexer.handlers.text, 'function');
    assert.equal(typeof lexer.handlers.star, 'function');
  });

  it('should expose the captured token to the given function', function() {
    var count = 0;
    lexer.capture('dot', /^\./, function(tok) {
      assert.equal(tok.type, 'dot');
      assert.equal(tok.val, '.');
      count++;
      return tok;
    });

    lexer.tokenize('...');
    assert.equal(count, 3);
    assert.equal(lexer.tokens.length, 3);
  });

  it('should expose the match on the token', function() {
    var count = 0;
    lexer.capture('dot', /^\.([a-z])\./, function(tok) {
      assert.equal(tok.match[0], '.a.');
      assert.equal(tok.match[1], 'a');
      count++;
      return tok;
    });

    lexer.tokenize('.a.');
    assert.equal(count, 1);
    assert.equal(lexer.tokens.length, 1);
  });

  it('should not call the function unless the regex matches', function() {
    var count = 0;
    lexer.capture('text', /^\w/);
    lexer.capture('dot', /^\./, function(tok) {
      count++;
      return tok;
    });

    lexer.tokenize('.a.b.');
    assert.equal(count, 3);
    assert.equal(lexer.tokens.length, 5);
  });

  it('should expose the lexer instance to handler', function() {
    var count = 0;
    lexer.capture('dot', /^\./, function(tok) {
      assert(Array.isArray(this.tokens));
      assert.equal(this.tokens.length, count);
      count++;
      return tok;
    });

    lexer.tokenize('.....');
    assert.equal(count, 5);
    assert.equal(lexer.tokens.length, 5);
  });

  it('should expose the lexer instance to handler', function() {
    var count = 0;
    lexer.capture('word', /^([a-y])/);
    lexer.capture('z', /^(z)/);
    lexer.capture('slash', /^(\/)/, function(tok) {
      if (tok) {
        assert(Array.isArray(this.tokens));
        count++;
        return tok;
      }
    });

    lexer.tokenize('a/z');
    assert.equal(count, 1);
  });

  it('should expose the lexer instance to handler', function() {
    var count = 0;

    lexer.set('word', function() {
      return this.scan(/^(\w)/, 'word');
    });

    lexer.set('slash', function() {
      var tok = this.scan(/^(\/)/, 'slash');
      if (tok) {
        var next = this.peek();
        if (next && next.type === 'word') {
          count++;
        }
        return tok;
      }
    });

    lexer.tokenize('a/b/c/d/e/');
    assert.equal(lexer.tokens.length, 10);
    assert.equal(count, 4);
  });
});
