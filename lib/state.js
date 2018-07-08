'use strict';

module.exports = class State {
  constructor(input) {
    this.indent = [''];
    this.queue = [];
    this.stack = [];
    this.stash = [''];
    this.output = [''];
    this.tokens = [];
    this.input = input; // unmodified user-defined input string
    this.string = input; // input string, minus consumed
    this.consumed = ''; // consumed part of the input string

    this.loc = {
      index: 0,
      column: 0,
      line: 1
    };
  }
};
