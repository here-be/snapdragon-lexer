'use strict';

require('mocha');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Lexer = require('..');
let lexer;

const fixtures = path.join.bind(path, __dirname, 'fixtures');

describe('options.source', function() {
  it('should get input string from lexer.options.source', function() {
    const lexer = new Lexer({ source: fixtures('file.txt') });
    assert.equal(lexer.options.source, fixtures('file.txt'));
    assert.equal(lexer.string, 'This is an input string.');
    assert.equal(lexer.input, 'This is an input string.');
  });
});
