'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.push', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should throw when value is not a token', function() {
    assert.throws(function() {
      lexer.push('foo');
    }, /expected/);
  });

  it('should accept any value when options.mode is "character"', function() {
    lexer.options.mode = 'character';
    lexer.push('foo');
  });

  it('should push token values onto `lexer.stash`', function() {
    lexer.push(lexer.token('star', '*'));
    lexer.push(lexer.token('dot', '.'));
    lexer.push(lexer.token('text', 'js'));
    assert.deepEqual(lexer.stash, ['*', '.', 'js']);
  });

  it('should not append when options.append is false', function() {
    lexer.options.append = false;
    lexer.push(lexer.token('star', '*'));
    lexer.push(lexer.token('dot', '.'));
    lexer.push(lexer.token('text', 'js'));
    assert.deepEqual(lexer.stash, ['']);
  });

  it('should not append when token.append is false', function() {
    lexer.options.append = false;
    lexer.push(lexer.token({type: 'star', value: '*', append: false}));
    lexer.push(lexer.token({type: 'dot', value: '.', append: false}));
    lexer.push(lexer.token({type: 'text', value: 'js', append: false}));
    assert.deepEqual(lexer.stash, ['']);
  });
});
