'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.current', () => {
  beforeEach(() => {
    lexer = new Lexer();
    lexer.capture('dot', /^\./);
    lexer.capture('star', /^\*/);
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.state.string = '//foo/bar.com';
  });

  it('should get the previous token', () => {
    lexer.tokenize('//foo/bar.com');
    var text = lexer.current;
    assert(text);
    assert.equal(text.type, 'text');
    assert.equal(text.value, 'com');
  });
});
