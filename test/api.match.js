'use strict';

require('mocha');
const assert = require('assert');
const State = require('../lib/state');
const Lexer = require('..');
let lexer;

describe('api.match', () => {
  beforeEach(() => {
    lexer = new Lexer('foo');
    lexer.capture('text', /^\w+/);
    lexer.capture('newline', /^\n+/);
  });

  it('should throw when arguments are invalid', () => {
    assert.throws(() => lexer.match(null), /expected/);
    assert.throws(() => lexer.match([]), /expected/);
    assert.throws(() => lexer.match({}), /expected/);
  });

  it('should throw when regex matches an empty string', () => {
    assert.throws(() => lexer.match(/^(?=.)/), /empty/);
  });

  it('should match with regex', () => {
    const match = lexer.match(/^\w/);
    assert(match);
    assert.equal(match[0], 'f');
    assert.equal(match.index, 0);
    assert.equal(match.input, 'foo');
  });

  it('should throw an error when regex does not have a boundary', () => {
    lexer = new Lexer();
    lexer.capture('slash', /\//);
    assert.throws(() => lexer.tokenize('a/b/c/d/e/f/g'));
  });

  it('should skip spaces', () => {
    lexer.state = new State('foo   bar');
    assert.equal(lexer.advance().type, 'text');
    assert.equal(lexer.match(/^[\t ]+/), '   ');
    assert.equal(lexer.advance().type, 'text');
  });

  it('should skip tabs and spaces', () => {
    lexer.state = new State('foo \t \t bar');
    assert.equal(lexer.advance().type, 'text');
    assert.equal(lexer.match(/^[\t ]+/), ' \t \t ');
    assert.equal(lexer.advance().type, 'text');
  });

  it('should not skip newlines', () => {
    lexer.state = new State('foo \t \n  bar');
    assert.equal(lexer.advance().type, 'text');
    assert.equal(lexer.match(/^[\t ]+/), ' \t ');
    assert.equal(lexer.advance().type, 'newline');
  });
});
