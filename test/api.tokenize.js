'use strict';

require('mocha');
const assert = require('assert');
const position = require('snapdragon-position');
const Token = require('snapdragon-token');
const Lexer = require('..');
let lexer;

describe('api.tokenize', function() {
  beforeEach(function() {
    lexer = new Lexer();
    lexer.use(position());
    lexer.capture('text', /^\w/);
  });

  it('should tokenize the given string', function() {
    let tokens = lexer.tokenize('abc');
    assert(Array.isArray(tokens));
    assert.equal(tokens.length, 3);
  });

  it('should tokenize the string passed to the constructor', function() {
    lexer = new Lexer('abcd');
    lexer.capture('text', /^\w/);
    let tokens = lexer.tokenize();
    assert(Array.isArray(tokens));
    assert(tokens.length, 4);
  });

  it('should patch token with .position', function() {
    var tokens = lexer.tokenize('abc');
    assert(Array.isArray(tokens));
    assert(tokens.length);

    var tok = tokens[0];
    assert.equal(tok.type, 'text');

    assert(tok.position);
    assert(tok.position.start);
    assert(tok.position.end);

    // a
    assert.equal(tok.position.start.line, 1);
    assert.equal(tok.position.start.column, 1);
    assert.equal(tok.position.end.line, 1);
    assert.equal(tok.position.end.column, 2);

    // b
    assert.equal(tokens[1].position.start.line, 1);
    assert.equal(tokens[1].position.start.column, 2);
    assert.equal(tokens[1].position.end.line, 1);
    assert.equal(tokens[1].position.end.column, 3);

    // c
    assert.equal(tokens[2].position.start.line, 1);
    assert.equal(tokens[2].position.start.column, 3);
    assert.equal(tokens[2].position.end.line, 1);
    assert.equal(tokens[2].position.end.column, 4);
  });

  it('should create a new Token with the given position', function() {
    var pos = lexer.position();
    var token = pos(new Token());

    assert(token.position);
    assert(token.position.start);
    assert(token.position.start.line);
    assert(token.position.start.column);

    assert(token.position.end);
    assert(token.position.end.line);
    assert(token.position.end.column);
  });

  it('should create a new Token with the given position and type', function() {
    var pos = lexer.position();
    var token = pos(new Token('*'));

    assert.equal(token.type, '*');

    assert(token.position);
    assert(token.position.start);
    assert(token.position.start.line);
    assert(token.position.start.column);

    assert(token.position.end);
    assert(token.position.end.line);
    assert(token.position.end.column);
  });

  it('should create a new Token with the given position, type, and val', function() {
    var pos = lexer.position();
    var token = pos(new Token('star', '*'));

    assert.equal(token.type, 'star');
    assert.equal(token.val, '*');

    assert(token.position);
    assert(token.position.start);
    assert(token.position.start.line);
    assert(token.position.start.column);

    assert(token.position.end);
    assert(token.position.end.line);
    assert(token.position.end.column);
  });

  it('should create a new Token with the given position and object', function() {
    var pos = lexer.position();
    var token = pos(new Token({ val: '*', type: 'star' }));

    assert.equal(token.val, '*');
    assert.equal(token.type, 'star');

    assert(token.position);
    assert(token.position.start);
    assert(token.position.start.line);
    assert(token.position.start.column);

    assert(token.position.end);
    assert(token.position.end.line);
    assert(token.position.end.column);
  });

  it('should patch line number onto token.position', function() {
    lexer.capture('slash', /^\//);
    lexer.capture('star', /^\*/);
    lexer.capture('text', /^\w+/);
    lexer.capture('dot', /^\./);
    lexer.capture('newline', /^\n/);

    const input = 'abc\nmno\nxyx';
    lexer.tokenize(input);

    const tokens = lexer.tokens;
    assert.equal(tokens[0].type, 'text');
    assert.equal(tokens[1].type, 'newline');
    assert.equal(tokens[2].type, 'text');

    assert.deepEqual(tokens[0].position, {
      start: {
        index: 0,
        column: 1,
        line: 1
      },
      end: {
        index: 3,
        column: 4,
        line: 1
      }
    });

    assert.deepEqual(tokens[1].position, {
      start: {
        index: 3,
        column: 4,
        line: 1
      },
      end: {
        index: 4,
        column: 1,
        line: 2
      }
    });

    assert.deepEqual(tokens[2].position, {
      start: {
        index: 4,
        column: 1,
        line: 2
      },
      end: {
        index: 7,
        column: 4,
        line: 2
      }
    });

    assert.deepEqual(tokens[3].position, {
      start: {
        index: 7,
        column: 4,
        line: 2
      },
      end: {
        index: 8,
        column: 1,
        line: 3
      }
    });

    assert.deepEqual(tokens[4].position, {
      start: {
        index: 8,
        column: 1,
        line: 3
      },
      end: {
        index: 11,
        column: 4,
        line: 3
      }
    });
  });
});
