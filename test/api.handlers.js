'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('lexer.handlers', () => {
  beforeEach(() => {
    lexer = new Lexer();
  });

  describe('.set', () => {
    it('should register handlers on the lexer.handlers object', () => {
      lexer.set('word', () => {});
      lexer.set('star', () => {});

      assert.equal(typeof lexer.handlers.get('word'), 'function');
      assert.equal(typeof lexer.handlers.get('star'), 'function');
    });

    it('should expose the lexer instance to registered handler', () => {
      var count = 0;

      lexer.set('word', function() {
        count++;
        assert(lexer === this, 'expected "this" to be an instance of Lexer');
      });

      lexer.handlers.get('word')();
      assert.equal(count, 1);
    });
  });

  describe('.get', () => {
    it('should get registered handlers from lexer.handlers', () => {
      lexer.set('word', () => {});
      lexer.set('star', () => {});

      assert.equal(typeof lexer.get('word'), 'function');
      assert.equal(typeof lexer.get('star'), 'function');
    });

    it('should throw an error when getting an unregistered handler', () => {
      assert.throws(() => {
        lexer.get('flfofofofofofo');
      });
    });
  });

  describe('.has', () => {
    it('should be true when a handler is registered', () => {
      lexer.set('word', () => {});
      assert(lexer.has('word'));
    });

    it('should be false when a handler is not registered', () => {
      assert(!lexer.has('slsllslsls'));
    });
  });
});
