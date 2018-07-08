'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.lookbehind', () => {
  beforeEach(() => {
    lexer = new Lexer();
    lexer.capture('dot', /^\./);
    lexer.capture('star', /^\*/);
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.state.string = '//foo/bar.com';
  });

  it('should throw an error when the first argument is not a number', () => {
    assert.throws(() => lexer.lookbehind(), /expected/);
  });

  it('should look behind "n" tokens', () => {
    lexer.tokenize('//foo/bar.com');
    var text = lexer.lookbehind(1);
    assert(text);
    assert.equal(text.type, 'text');
    assert.equal(text.value, 'com');

    var dot = lexer.lookbehind(2);
    assert(dot);
    assert.equal(dot.type, 'dot');
    assert.equal(dot.value, '.');
  });
});
