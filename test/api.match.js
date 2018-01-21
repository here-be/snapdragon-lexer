'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.match', function() {
  beforeEach(function() {
    lexer = new Lexer('foo');
    lexer.capture('text', /^\w+/);
    lexer.capture('newline', /^\n+/);
  });

  it('should throw when arguments are invalid', function() {
    assert.throws(() => lexer.match(null), /expected/);
    assert.throws(() => lexer.match([]), /expected/);
    assert.throws(() => lexer.match({}), /expected/);
  });

  it('should throw when regex matches an empty string', function() {
    assert.throws(() => lexer.match(/^(?=.)/), /empty/);
  });

  it('should match with regex', function() {
    const match = lexer.match(/^\w/);
    assert(match);
    assert.equal(match[0], 'f');
    assert.equal(match.index, 0);
    assert.equal(match.input, 'foo');
  });

  it('should throw an error when regex does not have a boundary', function() {
    lexer = new Lexer();
    lexer.capture('slash', /\//);
    assert.throws(() => lexer.tokenize('a/b/c/d/e/f/g'));
  });

  it('should skip spaces', function() {
    lexer.init('foo   bar');
    assert.equal(lexer.advance().type, 'text');
    assert.equal(lexer.match(/^[\t ]+/), '   ');
    assert.equal(lexer.advance().type, 'text');
  });

  it('should skip tabs and spaces', function() {
    lexer.init('foo \t \t bar');
    assert.equal(lexer.advance().type, 'text');
    assert.equal(lexer.match(/^[\t ]+/), ' \t \t ');
    assert.equal(lexer.advance().type, 'text');
  });

  it('should not skip newlines', function() {
    lexer.init('foo \t \n  bar');
    assert.equal(lexer.advance().type, 'text');
    assert.equal(lexer.match(/^[\t ]+/), ' \t ');
    assert.equal(lexer.advance().type, 'newline');
  });
});
