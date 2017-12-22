'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.skipWhile', function() {
  beforeEach(function() {
    lexer = new Lexer('//foo/bar.com')
      .capture('dot', /^\./)
      .capture('star', /^\*/)
      .capture('slash', /^\//)
      .capture('text', /^\w+/);
  });

  it('should skip while token.type does not match', function() {
    lexer.skipWhile(tok => tok.type !== 'dot');
    assert.equal(lexer.peek().type, 'dot');
    assert.equal(lexer.peek().value, '.');
  });

  it('should skip while lexer.string does not match', function() {
    lexer.skipWhile(tok => lexer.string[0] !== '.');
    assert.equal(lexer.peek().type, 'text');
    assert.equal(lexer.peek().value, 'bar');
  });
});
