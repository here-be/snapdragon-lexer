'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.regressions', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  describe('constructor:', function() {
    it('should return an instance of Lexer:', function() {
      assert(lexer instanceof Lexer);
    });
  });

  describe('prototype methods:', function() {
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
      it('should expose the `' + method + '` method', function() {
        assert.equal(typeof lexer[method], 'function', method);
      });
    });
  });
});
