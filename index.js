'use strict';

const Events = require('events');
const assert = require('assert');
const State = require('./lib/state');
const Token = require('./lib/token');
const Location = require('./lib/location');
const { Position } = Location;

/**
 * Create a new `Lexer` with the given `options`.
 *
 * ```js
 * const Lexer = require('snapdragon-lexer');
 * const lexer = new Lexer('foo/bar');
 * ```
 * @name Lexer
 * @param {string|Object} `input` (optional) Input string or options. You can also set input directly on `lexer.input` after initializing.
 * @param {object} `options`
 * @api public
 */

class Lexer extends Events {
  constructor(input, options = {}) {
    super();

    if (typeof input !== 'string') {
      options = input || {};
      input = '';
    }

    this.options = { ...options };
    this.handlers = new Map();
    this.types = new Set();
    this.state = new State(input);

    if (options.handlers) {
      for (const [type, handler] of options.handlers) {
        this.handler(type, handler);
      }
    }
  }

  /**
   * Returns true if we are still at the beginning-of-string, and
   * no part of the string has been consumed.
   *
   * @name .bos
   * @return {boolean}
   * @api public
   */

  bos() {
    return !this.state.consumed;
  }

  /**
   * Returns true if `lexer.string` and `lexer.queue` are empty.
   *
   * @name .eos
   * @return {boolean}
   * @api public
   */

  eos() {
    return this.state.string === '' && this.state.queue.length === 0;
  }

  /**
   * Register a handler function.
   *
   * ```js
   * lexer.set('star', function() {
   *   // do parser, lexer, or compiler stuff
   * });
   * ```
   * @name .set
   * @param {string} `type`
   * @param {function} `fn` The handler function to register.
   * @api public
   */

  set(type, handler = tok => tok) {
    this.types.add(type);
    const lexer = this;
    // can't do fat arrow here, we need to ensure that the handler
    // context is always correct whether handlers are called directly
    // or re-registered on a new instance, etc.
    this.handlers.set(type, function(...args) {
      let ctx = this || lexer;
      let loc = ctx.location();
      let tok = handler.call(ctx, ...args);
      if (tok && isObject(tok) && !Token.isToken(tok)) {
        tok = ctx.token(tok);
      }
      if (Token.isToken(tok) && !tok.type) {
        tok.type = type;
      }
      return Token.isToken(tok) ? loc(tok) : tok;
    });
    return this;
  }

  /**
   * Get a registered handler function.
   *
   * ```js
   * lexer.set('star', function() {
   *   // do lexer stuff
   * });
   * const star = lexer.get('star');
   * ```
   * @name .get
   * @param {string} `type`
   * @param {function} `fn` The handler function to register.
   * @api public
   */

  get(type) {
    let handler = this.handlers.get(type) || this.handlers.get('unknown');
    assert(handler, `expected handler "${type}" to be a function`);
    return handler;
  }

  /**
   * Returns true if the lexer has a registered handler of the given `type`.
   *
   * ```js
   * lexer.set('star', function() {});
   * console.log(lexer.has('star')); // true
   * ```
   * @name .has
   * @param {string} type
   * @return {boolean}
   * @api public
   */

  has(type) {
    return this.handlers.has(type);
  }

  /**
   * Create a new [Token][snapdragon-token] with the given `type` and `value`.
   *
   * ```js
   * console.log(lexer.token({type: 'star', value: '*'}));
   * console.log(lexer.token('star', '*'));
   * console.log(lexer.token('star'));
   * ```
   * @name .token
   * @emits token
   * @param {string|Object} `type` (required) The type of token to create
   * @param {string} `value` (optional) The captured string
   * @param {array} `match` (optional) Match results from `String.match()` or `RegExp.exec()`
   * @return {Object} Returns an instance of [snapdragon-token][]
   * @api public
   */

  token(type, value, match) {
    let token = new Token(type, value, match);
    this.emit('token', token);
    return token;
  }

  /**
   * Returns true if the given value is a [snapdragon-token][] instance.
   *
   * ```js
   * const Token = require('snapdragon-token');
   * lexer.isToken({}); // false
   * lexer.isToken(new Token({type: 'star', value: '*'})); // true
   * ```
   * @name .isToken
   * @param {object} `token`
   * @return {boolean}
   * @api public
   */

  isToken(token) {
    return Token.isToken(token);
  }

  /**
   * Consume the given length from `lexer.string`. The consumed value is used
   * to update `lexer.state.consumed`, as well as the current position.
   *
   * ```js
   * lexer.consume(1);
   * lexer.consume(1, '*');
   * ```
   * @name .consume
   * @param {number} `len`
   * @param {string} `value` Optionally pass the value being consumed.
   * @return {String} Returns the consumed value
   * @api public
   */

  consume(len, value = this.state.string.slice(0, len)) {
    this.state.consumed += value;
    this.state.string = this.state.string.slice(len);
    this.updateLocation(value, len);
    return value;
  }

  /**
   * Update column and line number based on `value`.
   *
   * @param {string} `value`
   * @return {undefined}
   */

  updateLocation(value, len = value.length) {
    let i = value.lastIndexOf('\n');
    this.state.loc.column = ~i ? len - i : this.state.loc.column + len;
    this.state.loc.line += Math.max(0, value.split('\n').length - 1);
    this.state.loc.index += len;
  }

  /**
   * Returns a function for updating a token with lexer
   * location information.
   *
   * @return {function}
   * @api public
   */

  location() {
    let start = new Position(this);

    return token => {
      let end = new Position(this);
      define(token, 'loc', new Location(start, end, this));
      return token;
    };
  }

  /**
   * Use the given `regex` to match a substring from `lexer.string`. Also validates
   * the regex to ensure that it starts with `^` since matching should always be
   * against the beginning of the string, and throws if the regex matches an empty
   * string, which can cause catastrophic backtracking.
   *
   * ```js
   * const lexer = new Lexer('foo/bar');
   * const match = lexer.match(/^\w+/);
   * console.log(match);
   * //=> [ 'foo', index: 0, input: 'foo/bar' ]
   * ```
   * @name .match
   * @param {regExp} `regex` (required)
   * @return {Array|null} Returns the match array from `RegExp.exec` or null.
   * @api public
   */

  match(regex) {
    assert(regex instanceof RegExp, 'expected a regular expression');

    if (regex.validated !== true) {
      assert(regex.source[0] === '^', 'expected regex to start with "^"');
      regex.validated = true;
    }

    let consumed = this.state.consumed;
    let match = regex.exec(this.state.string);
    if (!match) return null;

    if (match[0] === '') {
      throw new SyntaxError('regex should not match an empty string');
    }

    this.emit('match', match);
    define(match, 'consumed', consumed);
    this.consume(match[0].length, match[0]);
    return match;
  }

  /**
   * Scan for a matching substring by calling [.match()](#match)
   * with the given `regex`. If a match is found, 1) a token of the
   * specified `type` is created, 2) `match[0]` is used as `token.value`,
   * and 3) the length of `match[0]` is sliced from `lexer.string`
   * (by calling [.consume()](#consume)).
   *
   * ```js
   * lexer.string = '/foo/';
   * console.log(lexer.scan(/^\//, 'slash'));
   * //=> Token { type: 'slash', value: '/' }
   * console.log(lexer.scan(/^\w+/, 'text'));
   * //=> Token { type: 'text', value: 'foo' }
   * console.log(lexer.scan(/^\//, 'slash'));
   * //=> Token { type: 'slash', value: '/' }
   * ```
   * @name .scan
   * @emits scan
   * @param {string} `type`
   * @param {regExp} `regex`
   * @return {Object} Returns a token if a match is found, otherwise undefined.
   * @api public
   */

  scan(regex, type) {
    try {
      let match = this.match(regex);
      if (match) {
        let tok = this.token(type, match[0], match);
        this.emit('scan', tok);
        return tok;
      }
    } catch (err) {
      err.regex = regex;
      err.type = type;
      throw err;
    }
  }

  /**
   * Capture a token of the specified `type` using the provide `regex`
   * for scanning and matching substrings. Automatically registers a handler
   * when a function is passed as the last argument.
   *
   * ```js
   * lexer.capture('text', /^\w+/);
   * lexer.capture('text', /^\w+/, token => {
   *   if (token.value === 'foo') {
   *     // do stuff
   *   }
   *   return token;
   * });
   * ```
   * @name .capture
   * @param {string} `type` (required) The type of token being captured.
   * @param {regExp} `regex` (required) The regex for matching substrings.
   * @param {function} `fn` (optional) If supplied, the function will be called on the token before pushing it onto `lexer.tokens`.
   * @return {Object}
   * @api public
   */

  capture(type, regex, fn) {
    let handler = function() {
      let token = this.scan(regex, type);
      if (token) {
        return fn ? fn.call(this, token) : token;
      }
    };
    this.set(type, handler);
    return this;
  }

  /**
   * Calls handler `type` on `lexer.string`.
   *
   * ```js
   * const lexer = new Lexer('/a/b');
   * lexer.capture('slash', /^\//);
   * lexer.capture('text', /^\w+/);
   * console.log(lexer.handle('text'));
   * //=> undefined
   * console.log(lexer.handle('slash'));
   * //=> { type: 'slash', value: '/' }
   * console.log(lexer.handle('text'));
   * //=> { type: 'text', value: 'a' }
   * ```
   * @name .handle
   * @emits handle
   * @param {string} `type` The handler type to call on `lexer.string`
   * @return {Object} Returns a token of the given `type` or undefined.
   * @api public
   */

  handle(type) {
    let token = this.get(type).call(this);
    if (token) {
      this.current = token;
      this.emit('handle', token);
      return token;
    }
  }

  /**
   * Get the next token by iterating over `lexer.handlers` and
   * calling each handler on `lexer.string` until a handler returns
   * a token. If no handlers return a token, an error is thrown
   * with the substring that couldn't be lexed.
   *
   * ```js
   * const token = lexer.advance();
   * ```
   * @name .advance
   * @return {Object} Returns the first token returned by a handler, or the first character in the remaining string if `options.mode` is set to `character`.
   * @api public
   */

  advance() {
    if (this.eos()) return;
    if (this.options.mode === 'character') {
      return (this.current = this.consume(1));
    }
    for (let type of this.types) {
      let token = this.handle(type);
      if (token) {
        return token;
      }
    }
    this.fail();
  }

  /**
   * Tokenizes a string and returns an array of tokens.
   *
   * ```js
   * let lexer = new Lexer({ handlers: otherLexer.handlers })
   * lexer.capture('slash', /^\//);
   * lexer.capture('text', /^\w+/);
   * const tokens = lexer.lex('a/b/c');
   * console.log(tokens);
   * // Results in:
   * // [ Token { type: 'text', value: 'a' },
   * //   Token { type: 'slash', value: '/' },
   * //   Token { type: 'text', value: 'b' },
   * //   Token { type: 'slash', value: '/' },
   * //   Token { type: 'text', value: 'c' } ]
   * ```
   * @name .lex
   * @param {string} `input` The string to lex.
   * @return {Array} Returns an array of tokens.
   * @api public
   */

  lex(input, options) {
    if (options) this.options = { ...options };
    if (input) this.state = new State(input);
    while (this.push(this.next()));
    return this.state.tokens;
  }

  tokenize(...args) {
    return this.lex(...args);
  }

  /**
   * Push a token onto the `lexer.queue` array.
   *
   * ```js
   * console.log(lexer.queue.length); // 0
   * lexer.enqueue(new Token('star', '*'));
   * console.log(lexer.queue.length); // 1
   * ```
   * @name .enqueue
   * @param {object} `token`
   * @return {Object} Returns the given token with updated `token.index`.
   * @api public
   */

  enqueue(token) {
    token && this.state.queue.push(token);
    return token;
  }

  /**
   * Shift a token from `lexer.queue`.
   *
   * ```js
   * console.log(lexer.queue.length); // 1
   * lexer.dequeue();
   * console.log(lexer.queue.length); // 0
   * ```
   * @name .dequeue
   * @return {Object} Returns the given token with updated `token.index`.
   * @api public
   */

  dequeue() {
    return this.state.queue.length && this.state.queue.shift();
  }

  /**
   * Lookbehind `n` tokens.
   *
   * ```js
   * const token = lexer.lookbehind(2);
   * ```
   * @name .lookbehind
   * @param {number} `n`
   * @return {Object}
   * @api public
   */

  lookbehind(n) {
    assert(Number.isInteger(n), 'expected a positive integer');
    return this.state.tokens[this.state.tokens.length - n];
  }

  /**
   * Get the previously lexed token.
   *
   * ```js
   * const token = lexer.prev();
   * ```
   * @name .prev
   * @returns {Object|undefined} Returns a token or undefined.
   * @api public
   */

  prev() {
    return this.lookbehind(1);
  }

  /**
   * Lookahead `n` tokens and return the last token. Pushes any
   * intermediate tokens onto `lexer.tokens.` To lookahead a single
   * token, use [.peek()](#peek).
   *
   * ```js
   * const token = lexer.lookahead(2);
   * ```
   * @name .lookahead
   * @param {number} `n`
   * @return {Object}
   * @api public
   */

  lookahead(n) {
    assert(Number.isInteger(n), 'expected a positive integer');
    let fetch = n - this.state.queue.length;
    while (fetch-- > 0 && this.enqueue(this.advance()));
    return this.state.queue[--n];
  }

  /**
   * Lookahead a single token.
   *
   * ```js
   * const token = lexer.peek();
   * ```
   * @name .peek
   * @return {Object} Returns a token.
   * @api public
   */

  peek() {
    return this.lookahead(1);
  }

  /**
   * Get the next token, either from the `queue` or by [advancing](#advance).
   *
   * ```js
   * const token = lexer.next();
   * ```
   * @name .next
   * @returns {Object|String} Returns a token, or (when `options.mode` is set to `character`) either gets the next character from `lexer.queue`, or consumes the next charcter in the string.
   * @api public
   */

  next() {
    return this.dequeue() || this.advance();
  }

  /**
   * Skip `n` tokens or characters in the string. Skipped values are not enqueued.
   *
   * ```js
   * const token = lexer.skip(1);
   * ```
   * @name .skip
   * @param {number} `n`
   * @returns {Object} returns an array of skipped tokens.
   * @api public
   */

  skip(n) {
    assert.equal(typeof n, 'number', 'expected a number');
    return this.skipWhile(() => n-- > 0);
  }

  /**
   * Skip tokens while the given `fn` returns true.
   *
   * ```js
   * lexer.skipWhile(tok => tok.type !== 'space');
   * ```
   * @name .skipWhile
   * @param {function} `fn` Return true if a token should be skipped.
   * @returns {Array} Returns an array if skipped tokens.
   * @api public
   */

  skipWhile(fn = !this.eos()) {
    const skipped = [];
    while (fn.call(this, this.peek())) skipped.push(this.next());
    return skipped;
  }

  /**
   * Skip the given token `types`.
   *
   * ```js
   * lexer.skipWhile(tok => tok.type !== 'space');
   * ```
   * @name .skipType
   * @param {string|Array} `types` One or more token types to skip.
   * @returns {Array} Returns an array if skipped tokens.
   * @api public
   */

  skipTo(type) {
    return this.skipWhile(tok => tok && tok.type !== type).concat(this.next());
  }

  /**
   * Skip the given token `types`.
   *
   * ```js
   * lexer.skipType('space');
   * lexer.skipType(['newline', 'space']);
   * ```
   * @name .skipType
   * @param {string|Array} `types` One or more token types to skip.
   * @returns {Array} Returns an array if skipped tokens
   * @api public
   */

  skipType(types) {
    return this.skipWhile(tok => [].concat(types).includes(tok.type));
  }

  /**
   * Pushes the given `token` onto `lexer.tokens` and calls [.append()](#append) to push
   * `token.value` onto `lexer.stash`. Disable pushing onto the stash by setting
   * `lexer.options.append` or `token.append` to `false`.
   *
   * ```js
   * console.log(lexer.tokens.length); // 0
   * lexer.push(new Token('star', '*'));
   * console.log(lexer.tokens.length); // 1
   * console.log(lexer.stash) // ['*']
   * ```
   * @name .push
   * @emits push
   * @param {object|String} `token`
   * @return {Object} Returns the given `token`.
   * @api public
   */

  push(token) {
    if (!token && token !== '') return;
    if (this.options.mode !== 'character') {
      assert(this.isToken(token), 'expected token to be an instance of Token');
    }

    this.emit('push', token);
    this.state.tokens.push(token);

    if (this.options.stash === false || token.stash === false) {
      return token;
    }

    if (this.options.mode === 'character') {
      this.append(token);
    } else {
      this.append(token.value);
    }
    return token;
  }

  /**
   * Append a string to the last element on `lexer.stash`, or push the
   * string onto the stash if no elements exist.
   *
   * ```js
   * const stack = new Stack();
   * stack.push('a');
   * stack.push('b');
   * stack.push('c');
   * stack.append('_foo');
   * stack.append('_bar');
   * console.log(stack);
   * //=> Stack ['a', 'b', 'c_foo_bar']
   * ```
   * @name .append
   * @param {String} `value`
   * @return {String} Returns the last value in the array.
   * @api public
   */

  append(value) {
    if (typeof value !== 'string') return;
    let n = this.state.stash.length - 1;
    if (this.state.stash[n] === '') {
      this.state.stash[n] += value;
    } else {
      this.state.stash.push(value);
    }
    this.emit('append', value);
    return this;
  }

  /**
   * Returns true if a token with the given `type` is on the stack.
   *
   * ```js
   * if (lexer.isInside('bracket') || lexer.isInside('brace')) {
   *   // do stuff
   * }
   * ```
   * @name .isInside
   * @param {string} `type` The type to check for.
   * @return {boolean}
   * @api public
   */

  isInside(type) {
    return this.state.stack.some(tok => tok.type === type);
  }

  /**
   * Throw a formatted error message with details including the cursor position.
   *
   * ```js
   * lexer.set('foo', function(tok) {
   *   if (tok.value !== 'foo') {
   *     throw this.state.error('expected token.value to be "foo"', tok);
   *   }
   * });
   * ```
   * @name .error
   * @param {string} `msg` Message to use in the Error.
   * @param {object} `node`
   * @return {undefined}
   * @api public
   */

  error(err) {
    if (typeof err === 'string') err = new Error(err);
    if (this.listenerCount('error') > 0) {
      this.emit('error', err);
    } else {
      throw err;
    }
  }

  /**
   * Throw an error if `lexer.stack` is not empty, or when the remaining string
   * cannot be lexed by the currently registered handlers.
   * @api private
   */

  fail() {
    let token = this.state.stack.pop();
    if (token) {
      const match = token && token.match;
      const value = match ? match[0] : token[this.options.value || 'value'];
      throw new Error(`unclosed: "${value}"`);
    }
    if (this.state.string) {
      throw new Error(`unmatched input: "${this.state.string.slice(0, 10)}"`);
    }
  }

  /**
   * Call a plugin function on the lexer instance.
   *
   * ```js
   * lexer.use(function(lexer) {
   *   // do stuff to lexer
   * });
   * ```
   * @name .use
   * @param {function} `fn`
   * @return {object} Returns the lexer instance.
   * @api public
   */

  use(fn) {
    fn.call(this, this);
    return this;
  }

  /**
   * Static method that returns true if the given value is an
   * instance of `snapdragon-lexer`.
   *
   * ```js
   * const Lexer = require('snapdragon-lexer');
   * const lexer = new Lexer();
   * console.log(Lexer.isLexer(lexer)); //=> true
   * console.log(Lexer.isLexer({})); //=> false
   * ```
   * @name Lexer#isLexer
   * @param {object} `lexer`
   * @returns {Boolean}
   * @api public
   * @static
   */

  static isLexer(lexer) {
    return lexer instanceof Lexer;
  }

  /**
   * Static method that returns true if the given value is an
   * instance of `snapdragon-token`. This is a proxy to `Token#isToken`.
   *
   * ```js
   * const Token = require('snapdragon-token');
   * const Lexer = require('snapdragon-lexer');
   * console.log(Lexer.isToken(new Token({type: 'foo'}))); //=> true
   * console.log(Lexer.isToken({})); //=> false
   * ```
   * @name Lexer#isToken
   * @param {object} `lexer`
   * @returns {Boolean}
   * @api public
   * @static
   */

  static isToken(token) {
    return token instanceof Token;
  }

  /**
   * The State class, exposed as a static property.
   * @name Lexer#State
   * @api public
   * @static
   */

  static get State() {
    return State;
  }

  /**
   * The Token class, exposed as a static property.
   * @name Lexer#Token
   * @api public
   * @static
   */

  static get Token() {
    return Token;
  }
}

/**
 * Returns true if value is an object
 */

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Define a non-enumerable property on `obj`
 */

function define(obj, key, value) {
  Reflect.defineProperty(obj, key, { value });
}

/**
 * Expose `Lexer`
 * @type {Class}
 */

module.exports = Lexer;
