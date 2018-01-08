'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.append', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should do nothing when the value is falsey', function() {
    lexer.append('');
    lexer.append();
    lexer.append(null);
    lexer.append(false);
    assert.deepEqual(lexer.stash, ['']);
  });

  it('should push token values onto "lexer.stash"', function() {
    lexer.append('*');
    lexer.append('.');
    lexer.append('js');
    assert.deepEqual(lexer.stash, ['*', '.', 'js']);
  });
});
