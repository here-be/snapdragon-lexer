'use strict';

class State {
  constructor(input, options) {
    if (typeof input !== 'string') {
      options = input;
      input = '';
    }

    this.indent = [''];
    this.queue = [];
    this.stack = [];
    this.stash = [''];
    this.output = [''];
    this.tokens = [];

    this.options = { ...options };
    this.input = input;  // unmodified user-defined input string
    this.string = input; // input string, minus consumed
    this.consumed = '';  // consumed part of the input string

    this.loc = {
      index: 0,
      column: 0,
      line: 1
    };
  }
}

/**
 * Expose State
 */

module.exports = State;
