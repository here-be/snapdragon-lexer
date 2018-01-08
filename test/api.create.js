'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('..');
let lexer;

describe('api.create', function() {
  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should create a new Lexer', function() {
    assert(lexer.create() instanceof Lexer);
  });

  it('should create a new Lexer with the handlers from the given lexer instance', function() {
    lexer.capture('text', /^\w+/);
    lexer.capture('star', /^\*/);
    const created = lexer.create({}, lexer);
    assert(created instanceof Lexer);
    assert.equal(typeof created.handlers.text, 'function');
    assert.equal(typeof created.handlers.star, 'function');
  });

  it('should create a new Lexer when an instance is passed to the ctor', function() {
    lexer.capture('text', /^\w+/);
    lexer.capture('star', /^\*/);
    const created = new Lexer(lexer);
    assert(created instanceof Lexer);
    assert.equal(typeof created.handlers.text, 'function');
    assert.equal(typeof created.handlers.star, 'function');
  });
});
