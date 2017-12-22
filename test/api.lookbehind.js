'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.lookbehind', function() {
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
      lexer.lookbehind();
    });
  });

  it('should look behind "n" tokens', function() {
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
