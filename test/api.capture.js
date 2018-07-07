'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.capture', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should register a handler with type and regex only', function() {
    lexer.capture('text', /^\w+/);
    lexer.capture('star', /^\*/);

    assert.equal(typeof lexer.handlers.get('text'), 'function');
    assert.equal(typeof lexer.handlers.get('star'), 'function');
  });

  it('should register a handler with type, regex and handler function', function() {
    lexer.capture('text', /^\w+/, function() {});
    lexer.capture('star', /^\*/, function() {});

    assert.equal(typeof lexer.handlers.get('text'), 'function');
    assert.equal(typeof lexer.handlers.get('star'), 'function');
  });

  it('should expose the captured token to the given function', function() {
    let count = 0;
    lexer.capture('dot', /^\./, function(tok) {
      assert.equal(tok.type, 'dot');
      assert.equal(tok.value, '.');
      count++;
      return tok;
    });

    lexer.lex('...');
    assert.equal(count, 3);
    assert.equal(lexer.tokens.length, 3);
  });

  it('should expose the match on the token', function() {
    let count = 0;
    lexer.capture('dot', /^\.([a-z])\./, function(tok) {
      assert.equal(tok.match[0], '.a.');
      assert.equal(tok.match[1], 'a');
      count++;
      return tok;
    });

    lexer.lex('.a.');
    assert.equal(count, 1);
    assert.equal(lexer.tokens.length, 1);
  });

  it('should not call the function unless the regex matches', function() {
    let count = 0;
    lexer.capture('text', /^\w/);
    lexer.capture('dot', /^\./, function(tok) {
      count++;
      return tok;
    });

    lexer.lex('.a.b.');
    assert.equal(count, 3);
    assert.equal(lexer.tokens.length, 5);
  });

  it('should expose the lexer instance to handler', function() {
    let count = 0;
    lexer.capture('dot', /^\./, function(tok) {
      assert(Array.isArray(this.tokens));
      assert.equal(this.tokens.length, count);
      count++;
      return tok;
    });

    lexer.lex('.....');
    assert.equal(count, 5);
    assert.equal(lexer.tokens.length, 5);
  });

  it('should expose the lexer instance to handler', function() {
    let count = 0;
    lexer.capture('word', /^([a-y])/);
    lexer.capture('z', /^(z)/);
    lexer.capture('slash', /^(\/)/, function(tok) {
      if (tok) {
        assert(Array.isArray(this.tokens));
        count++;
        return tok;
      }
    });

    lexer.lex('a/z');
    assert.equal(count, 1);
  });
});
