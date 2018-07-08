'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.use', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  it('should call a plugin function with the lexer instance', cb => {
    lexer.use(function() {
      assert(this instanceof Lexer);
      cb();
    });
  });
});
