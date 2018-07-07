'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.last', function() {
  beforeEach(function() {
    lexer = new Lexer();
    lexer.capture('dot', /^\./);
    lexer.capture('star', /^\*/);
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.string = '//foo/bar.com';
  });

  it('should get the last token on the tokens array', function() {
    lexer.tokenize('//foo/bar.com');
    var text = lexer.last();
    assert(text);
    assert.equal(text.type, 'text');
    assert.equal(text.value, 'com');
  });
});
