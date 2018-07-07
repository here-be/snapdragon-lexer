'use strict';

const Stack = require('./stack');

class State {
  constructor(input, options) {
    if (typeof input !== 'string') {
      options = input;
      input = '';
    }
    this.options = options || {};
    this.handlers = new Map();
    this.types = new Set();
    this.stash = new Stack('');
    this.indent = new Stack('');
    this.output = new Stack('');
    this.tokens = new Stack();
    this.queue = new Stack();
    this.stack = new Stack();
    this.consumed = ''; // consumed part of the input string
    this.input = input; // unmodified user-defined input string
    this.string = input; // input string, minus consumed
    this.loc = {
      index: 0,
      column: 0,
      line: 1
    };
  }
}
