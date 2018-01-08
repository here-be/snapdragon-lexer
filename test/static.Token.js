'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

class Token extends Lexer.Token {
  constructor(...args) {
    super(...args);
    this.isCustom = true;
  }
}

describe('static.Token', function() {
  it('should set the class to use for creating a lexer.token', function() {
    Lexer.Token = Token;
    const lexer = new Lexer();
    assert(lexer.token('foo'));
    assert(lexer.token('foo').isCustom);
  });
});
