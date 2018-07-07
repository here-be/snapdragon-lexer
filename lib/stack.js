'use strict';

class Stack extends Array {
  append(val) {
    this[this.length - 1] += val;
  }
  last() {
    return this[this.length - 1];
  }
  lastChild() {
    const tok = this[this.length - 1];
    if (tok && tok.nodes) {
      return tok.lastChild();
    }
    return tok;
  }
}

module.exports = Stack;
