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
    assert.throws(() => lexer.push('foo'), /expected/);
  });

  it('should accept any value when options.mode is "character"', function() {
    lexer.options.mode = 'character';
    lexer.push('foo');
  });

  it('should push token values onto `lexer.state.stash`', function() {
    lexer.push(lexer.token('star', '*'));
    lexer.push(lexer.token('dot', '.'));
    lexer.push(lexer.token('text', 'js'));
    assert.deepEqual(lexer.state.stash, ['*', '.', 'js']);
  });

  it('should not stash when options.stash is false', function() {
    lexer.options.stash = false;
    lexer.push(lexer.token('star', '*'));
    lexer.push(lexer.token('dot', '.'));
    lexer.push(lexer.token('text', 'js'));
    assert.deepEqual(lexer.state.stash, ['']);
  });

  it('should not add value when token.stash is false', function() {
    lexer.options.stash = false;
    lexer.push(lexer.token({type: 'star', value: '*', stash: false}));
    lexer.push(lexer.token({type: 'dot', value: '.', stash: false}));
    lexer.push(lexer.token({type: 'text', value: 'js', stash: false}));
    assert.deepEqual(lexer.state.stash, ['']);
  });
});
