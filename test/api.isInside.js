'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.isInside', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should be true when type matches the last token on lexer.stack', function() {
    lexer.stack.push(lexer.token('foo'));
    assert(lexer.isInside('foo'));
  });

  it('should be false when type does not match last token on lexer.stack', function() {
    lexer.stack.push(lexer.token('foo'));
    assert(!lexer.isInside('bar'));
  });
});
