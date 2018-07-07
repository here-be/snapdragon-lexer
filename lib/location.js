'use strict';

class Position {
  constructor(lexer) {
    this.index = lexer.state.loc.index;
    this.column = lexer.state.loc.column;
    this.line = lexer.state.loc.line;
  }
}

class Location {
  constructor(start, end, lexer) {
    this.start = start;
    this.end = end;
    this.source = lexer.options.source;
  }
  get range() {
    return [this.start.index, this.end.index];
  }
  static get Position() {
    return Position;
  }
}

module.exports = Location;
