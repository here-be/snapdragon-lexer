'use strict';

require('mocha');
const assert = require('assert');
const Token = require('../lib/token');
const Lexer = require('..');
let lexer;

describe('lexer.lex', () => {
  beforeEach(() => {
    lexer = new Lexer();
    lexer.isLexer = true;
    lexer.capture('text', /^\w/);
  });

  it('should lex the given string', () => {
    const tokens = lexer.lex('abc');
    assert(Array.isArray(tokens));
    assert.equal(tokens.length, 3);
  });

  it('should lex the string passed to the constructor', () => {
    lexer = new Lexer('abcd');
    lexer.capture('text', /^\w/);
    assert.equal(lexer.state.input, 'abcd');

    const tokens = lexer.lex();
    assert(Array.isArray(tokens));
    assert(tokens.length, 4);
  });

  it('should patch token with .loc', () => {
    const tokens = lexer.lex('abc');
    assert(Array.isArray(tokens));
    assert(tokens.length);

    const tok = tokens[0];
    assert.equal(tok.type, 'text');

    assert(tok.loc);
    assert(tok.loc.start);
    assert(tok.loc.end);

    // a
    assert.equal(tok.loc.start.line, 1);
    assert.equal(tok.loc.start.column, 0);
    assert.equal(tok.loc.end.line, 1);
    assert.equal(tok.loc.end.column, 1);

    // b
    assert.equal(tokens[1].loc.start.line, 1);
    assert.equal(tokens[1].loc.start.column, 1);
    assert.equal(tokens[1].loc.end.line, 1);
    assert.equal(tokens[1].loc.end.column, 2);

    // c
    assert.equal(tokens[2].loc.start.line, 1);
    assert.equal(tokens[2].loc.start.column, 2);
    assert.equal(tokens[2].loc.end.line, 1);
    assert.equal(tokens[2].loc.end.column, 3);
  });

  it('should create a new Token with the given loc', () => {
    const loc = lexer.location();
    const token = loc(new Token());

    assert(token.loc);
    assert(token.loc.start);
    assert(token.loc.start.line);
    assert.equal(token.loc.start.column, 0);

    assert(token.loc.end);
    assert(token.loc.end.line);
    assert.equal(token.loc.end.column, 0);
  });

  it('should set/get location range', () => {
    lexer = new Lexer('foo/**/*.js');
    lexer.capture('stars', /^\*+/);
    lexer.capture('slash', /^\//);
    lexer.capture('dot', /^\./);
    lexer.capture('text', /^\w+/);
    lexer.lex();

    const stars = lexer.state.tokens.find(tok => tok.type === 'stars');
    assert.deepEqual(stars.loc.range, [4, 6]);
  });

  it('should create a new Token with the given loc and type', () => {
    const loc = lexer.location();
    const token = loc(new Token('*'));

    assert.equal(token.type, '*');

    assert(token.loc);
    assert(token.loc.start);
    assert(token.loc.start.line);
    assert.equal(token.loc.start.column, 0);

    assert(token.loc.end);
    assert(token.loc.end.line);
    assert.equal(token.loc.end.column, 0);
  });

  it('should create a new Token with the given loc, type, and val', () => {
    const loc = lexer.location();
    const token = loc(new Token('star', '*'));

    assert.equal(token.type, 'star');
    assert.equal(token.value, '*');

    assert(token.loc);
    assert(token.loc.start);
    assert(token.loc.start.line);
    assert.equal(token.loc.start.column, 0);

    assert(token.loc.end);
    assert(token.loc.end.line);
    assert.equal(token.loc.end.column, 0);
  });

  it('should create a new Token with the given loc and object', () => {
    const loc = lexer.location();
    const token = loc(new Token('star', '*'));

    assert.equal(token.value, '*');
    assert.equal(token.type, 'star');

    assert(token.loc);
    assert(token.loc.start);
    assert(token.loc.start.line);
    assert.equal(token.loc.start.column, 0);

    assert(token.loc.end);
    assert(token.loc.end.line);
    assert.equal(token.loc.end.column, 0);
  });

  it('should patch line number onto token.loc', () => {
    lexer.capture('slash', /^\//);
    lexer.capture('star', /^\*/);
    lexer.capture('text', /^\w+/);
    lexer.capture('dot', /^\./);
    lexer.capture('newline', /^\n/);

    lexer.lex('abc\nmno\nxyx');

    const tokens = lexer.state.tokens;
    assert.equal(tokens[0].type, 'text');
    assert.equal(tokens[1].type, 'newline');
    assert.equal(tokens[2].type, 'text');

    assert.deepEqual(tokens[0].loc, {
      source: undefined,
      start: {
        index: 0,
        column: 0,
        line: 1
      },
      end: {
        index: 3,
        column: 3,
        line: 1
      }
    });

    assert.deepEqual(tokens[1].loc, {
      source: undefined,
      start: {
        index: 3,
        column: 3,
        line: 1
      },
      end: {
        index: 4,
        column: 1,
        line: 2
      }
    });

    assert.deepEqual(tokens[2].loc, {
      source: undefined,
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

    assert.deepEqual(tokens[3].loc, {
      source: undefined,
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

    assert.deepEqual(tokens[4].loc, {
      source: undefined,
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
