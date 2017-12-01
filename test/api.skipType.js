'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.skipType', function() {
  beforeEach(function() {
    lexer = new Lexer('//foo/bar.com')
      .capture('dot', /^\./)
      .capture('star', /^\*/)
      .capture('slash', /^\//)
      .capture('text', /^\w+/);
  });

  it('should skip the specified tokens', function() {
    lexer.skipType(['slash', 'text']);
    assert.equal(lexer.peek().type, 'dot');
  });
});
