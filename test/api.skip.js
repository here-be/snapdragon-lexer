'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.skip', function() {
  beforeEach(function() {
    lexer = new Lexer('//foo/bar.com')
      .capture('dot', /^\./)
      .capture('star', /^\*/)
      .capture('slash', /^\//)
      .capture('text', /^\w+/);
  });

  it('should skip the specified number of tokens', function() {
    lexer.skip(2);
    assert.equal(lexer.peek().type, 'text');
  });

  it('should not add the next (peeked) token to the queue', function() {
    lexer.skip(2);
    assert.equal(lexer.state.queue.length, 1);
  });
});
