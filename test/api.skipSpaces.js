'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.skipSpaces', function() {
  beforeEach(function() {
    lexer = new Lexer('foo   bar')
      .capture('text', /^\w+/);
  });

  it('should skip spaces', function() {
    assert.equal(lexer.advance().type, 'text');
    lexer.skipSpaces();
    assert.equal(lexer.advance().type, 'text');
  });
});
