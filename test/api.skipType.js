'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.skipType', () => {
  beforeEach(() => {
    lexer = new Lexer('//foo/bar.com')
      .capture('dot', /^\./)
      .capture('star', /^\*/)
      .capture('slash', /^\//)
      .capture('text', /^\w+/);
  });

  it('should skip the specified types', () => {
    lexer.skipType(['slash', 'text']);
    assert.equal(lexer.peek().type, 'dot');
  });

  it('should skip the specified type', () => {
    lexer.skipType('slash');
    assert.equal(lexer.peek().type, 'text');
  });
});
