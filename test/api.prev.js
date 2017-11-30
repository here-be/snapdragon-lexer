'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.prev', function() {
  beforeEach(function() {
    lexer = new Lexer();
    lexer.capture('dot', /^\./);
    lexer.capture('star', /^\*/);
    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);
    lexer.string = '//foo/bar.com';
  });

  it('should get the previous token', function() {
    lexer.tokenize('//foo/bar.com');
    var text = lexer.prev();
    assert(text);
    assert.equal(text.type, 'dot');
    assert.equal(text.val, '.');
  });
});
