'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

class Stack extends Lexer.Stack {
  constructor(...args) {
    super(...args);
    this.isCustom = true;
  }
}

describe('static.Stack', function() {
  it('should set the class to use for creating a lexer.token', function() {
    Lexer.Stack = Stack;
    const lexer = new Lexer();
    assert(lexer.stack instanceof Stack);
  });
});
