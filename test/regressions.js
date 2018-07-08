'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.regressions', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  describe('constructor:', () => {
    it('should return an instance of Lexer:', () => {
      assert(lexer instanceof Lexer);
    });
  });

  describe('prototype methods:', () => {
    var methods = [
      'advance',
      'get',
      'match',
      'next',
      'location',
      'prev',
      'set',
      'skip',
      'token',
      'tokenize',
      'updateLocation',
      'use',
    ];

    methods.forEach(function(method) {
      it('should expose the `' + method + '` method', () => {
        assert.equal(typeof lexer[method], 'function', method);
      });
    });
  });
});
