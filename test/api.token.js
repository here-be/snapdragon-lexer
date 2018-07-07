'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.token', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should return an instance of lexer.Token', function() {
    assert(lexer.token('foo') instanceof Lexer.Token);
  });

  it('should create a token from a string', function() {
    const token = lexer.token('foo');
    assert.equal(token.type, 'foo');
    assert.equal(token.value, undefined);
  });

  it('should create a token from a string and value', function() {
    const token = lexer.token('foo', 'bar');
    assert.equal(token.type, 'foo');
    assert.equal(token.value, 'bar');
  });

  it('should create a token from an object', function() {
    const token = lexer.token({type: 'foo', value: 'bar'});
    assert.equal(token.type, 'foo');
    assert.equal(token.value, 'bar');
  });

  it('should create a token from an object and match array', function() {
    const token = lexer.token({type: 'foo', value: 'bar'}, ['bar']);
    assert.equal(token.type, 'foo');
    assert.equal(token.value, 'bar');
    assert.deepEqual(token.match, ['bar']);
  });

  it('should create a token from type and match array', function() {
    const token = lexer.token('foo', ['bar']);
    assert.equal(token.type, 'foo');
    assert.equal(token.value, 'bar');
    assert.deepEqual(token.match, ['bar']);
  });

  it('should emit "token"', function() {
    let tokens = [];

    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.capture('star', /^\*/);
    lexer.on('token', (tok) => tokens.push(tok));

    lexer.lex('a/*/b');
    assert.equal(tokens.length, 5);
  });
});
