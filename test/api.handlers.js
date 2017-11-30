'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.handlers', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  describe('.set', function() {
    it('should register handlers on the lexer.handlers object', function() {
      lexer.set('word', function() {});
      lexer.set('star', function() {});

      assert.equal(typeof lexer.handlers.word, 'function');
      assert.equal(typeof lexer.handlers.star, 'function');
    });

    it('should expose the lexer instance to registered handler', function() {
      var count = 0;

      lexer.set('word', function() {
        count++;
        assert(lexer === this, 'expected "this" to be an instance of Lexer');
      });

      lexer.handlers.word();
      assert.equal(count, 1);
    });
  });

  describe('.get', function() {
    it('should get registered handlers from lexer.handlers', function() {
      lexer.set('word', function() {});
      lexer.set('star', function() {});

      assert.equal(typeof lexer.get('word'), 'function');
      assert.equal(typeof lexer.get('star'), 'function');
    });

    it('should throw an error when getting an unregistered handler', function() {
      assert.throws(function() {
        lexer.get('flfofofofofofo');
      });
    });
  });
});
