'use strict';

class Position {
  constructor(lexer) {
    this.index = lexer.loc.index;
    this.column = lexer.loc.column;
    this.line = lexer.loc.line;
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
