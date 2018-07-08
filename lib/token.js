'use strict';

const isObject = val => val && typeof val === 'object' && !Array.isArray(val);

class Token {
  constructor(type, value, match) {
    if (Array.isArray(value)) {
      match = value;
      value = match[1] || match[0];
    }

    if (isObject(type)) {
      Object.assign(this, type);
    } else {
      this.type = type;
      this.value = value;
    }

    Reflect.defineProperty(this, 'match', {
      value: this.match || match
    });
  }

  static isToken(val) {
    return val instanceof this;
  }
}

module.exports = Token;
