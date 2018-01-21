'use strict';

/**
 * Module dependencies
 */

const fs = require('fs');
const assert = require('assert');
const typeOf = require('kind-of');
const Handlers = require('snapdragon-handlers');
let Stack = require('snapdragon-stack');
let Token = require('snapdragon-token');

/**
 * Create a new `Lexer` with the given `options`.
 *
 * ```js
 * const Lexer = require('snapdragon-lexer');
 * const lexer = new Lexer('foo/bar');
 * ```
 * @name Lexer
 * @param {String|Object} `input` (optional) Input string or options. You can also set input directly on `lexer.input` after initializing.
 * @param {Object} `options`
 * @api public
 */

class Lexer extends Handlers {
  constructor(input, options) {
    if (typeof input !== 'string') {
      options = input;
      input = '';
    }
    super(options);
    if (Lexer.isLexer(options)) {
      return this.create(options.options, options);
    }

    define(this, 'isLexer', true);
    this.string = '';
    this.input = '';
    this.init(input);
  }

  /**
   * Initialize lexer state properties
   */

  init(input) {
    if (input) this.input = this.string = input.toString();
    if (!input && isString(this.options.source)) {
      return this.init(fs.readFileSync(this.options.source));
    }

    this.consumed = '';
    this.tokens = new this.Stack();
    this.stack = new this.Stack();
    this.stash = new this.Stack('');

    define(this.stash, 'append', function(val) {
      this[this.length - 1] += val;
    });

    this.queue = [];
    this.loc = {
      index: 0,
      column: 0,
      line: 1
    };
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
   * @param {String|Object} `type` (required) The type of token to create
   * @param {String} `value` (optional) The captured string
   * @param {Array} `match` (optional) Match arguments returned from `String.match` or `RegExp.exec`
   * @return {Object} Returns an instance of [snapdragon-token][]
   * @api public
   */

  token(type, value, match) {
    const token = new this.Token(type, value, match);
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
   * @param {Object} `token`
   * @return {Boolean}
   * @api public
   */

  isToken(token) {
    return this.Token.isToken(token);
  }

  /**
   * Consume the given length from `lexer.string`. The consumed value is used
   * to update `lexer.consumed`, as well as the current position.
   *
   * ```js
   * lexer.consume(1);
   * lexer.consume(1, '*');
   * ```
   * @name .consume
   * @param {Number} `len`
   * @param {String} `value` Optionally pass the value being consumed.
   * @return {String} Returns the consumed value
   * @api public
   */

  consume(len, value) {
    if (!value) value = this.string.slice(0, len);
    this.consumed += value;
    this.string = this.string.slice(len);
    this.updateLocation(value, len);
    return value;
  }

  /**
   * Update column and line number based on `value`.
   * @param {String} `value`
   * @return {undefined}
   */

  updateLocation(value, len) {
    if (typeof len !== 'number') len = value.length;
    const i = value.lastIndexOf('\n');
    this.loc.column = ~i ? len - i : this.loc.column + len;
    this.loc.line += Math.max(0, value.split('\n').length - 1);
    this.loc.index += len;
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
   * @param {RegExp} `regex` (required)
   * @return {Array|null} Returns the match array from `RegExp.exec` or null.
   * @api public
   */

  match(regex) {
    assert.equal(typeOf(regex), 'regexp', 'expected a regular expression');
    if (regex.validated !== true) {
      assert(/^\^/.test(regex.source), 'expected regex to start with "^"');
      regex.validated = true;
    }

    const consumed = this.consumed;
    const match = regex.exec(this.string);
    if (!match) return null;

    if (match[0] === '') {
      throw new SyntaxError('regex should not match an empty string');
    }

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
   * @param {String} `type`
   * @param {RegExp} `regex`
   * @return {Object} Returns a token if a match is found, otherwise undefined.
   * @api public
   */

  scan(regex, type) {
    try {
      const match = this.match(regex);
      if (!match) return;
      const token = this.token(type, match);
      this.emit('scan', token);
      return token;
    } catch (err) {
      err.regex = regex;
      err.type = type;
      this.error(err);
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
   * @param {String} `type` (required) The type of token being captured.
   * @param {RegExp} `regex` (required) The regex for matching substrings.
   * @param {Function} `fn` (optional) If supplied, the function will be called on the token before pushing it onto `lexer.tokens`.
   * @return {Object}
   * @api public
   */

  capture(type, regex, fn) {
    this.set(type, function() {
      let token = this.scan(regex, type);
      if (token) {
        return fn ? fn.call(this, token) : token;
      }
    });
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
   * @param {String} `type` The handler type to call on `lexer.string`
   * @return {Object} Returns a token of the given `type` or undefined.
   * @api public
   */

  handle(type) {
    const token = this.get(type).call(this);
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
    if (!this.string) return;
    if (this.options.mode === 'character') {
      return (this.current = this.consume(1));
    }

    for (const type of this.types) {
      const token = this.handle(type);
      if (token) return token;
    }

    this.fail();
  }

  /**
   * Tokenizes a string and returns an array of tokens.
   *
   * ```js
   * lexer.capture('slash', /^\//);
   * lexer.capture('text', /^\w+/);
   * const tokens = lexer.tokenize('a/b/c');
   * console.log(tokens);
   * // Results in:
   * // [ Token { type: 'text', value: 'a' },
   * //   Token { type: 'slash', value: '/' },
   * //   Token { type: 'text', value: 'b' },
   * //   Token { type: 'slash', value: '/' },
   * //   Token { type: 'text', value: 'c' } ]
   * ```
   * @name .tokenize
   * @param {String} `input` The string to tokenize.
   * @return {Array} Returns an array of tokens.
   * @api public
   */

  tokenize(input) {
    if (input) this.init(input);
    while (this.push(this.next()));
    return this.tokens;
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
   * @param {Object} `token`
   * @return {Object} Returns the given token with updated `token.index`.
   * @api public
   */

  enqueue(token) {
    if (!token) return;
    this.queue.push(token);
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
    return this.queue.length && this.queue.shift();
  }

  /**
   * Lookbehind `n` tokens.
   *
   * ```js
   * const token = lexer.lookbehind(2);
   * ```
   * @name .lookbehind
   * @param {Number} `n`
   * @return {Object}
   * @api public
   */

  lookbehind(n) {
    return this.tokens.lookbehind(n);
  }

  /**
   * Get the previous token.
   *
   * ```js
   * const token = lexer.prev();
   * ```
   * @name .prev
   * @returns {Object} Returns a token.
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
   * @param {Number} `n`
   * @return {Object}
   * @api public
   */

  lookahead(n) {
    assert.equal(typeof n, 'number', 'expected a number');
    let fetch = n - this.queue.length;
    while (fetch-- > 0 && this.enqueue(this.advance()));
    return this.queue[--n];
  }

  /**
   * Lookahead a single token.
   *
   * ```js
   * const token = lexer.peek();
   * ```
   * @name .peek
   * @return {Object} `token`
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
   * @param {Number} `n`
   * @returns {Object} returns the very last lexed/skipped token.
   * @api public
   */

  skip(n) {
    assert.equal(typeof n, 'number', 'expected a number');
    return this.skipWhile(() => n-- > 0);
  }

  /**
   * Skip the given token `types`.
   *
   * ```js
   * lexer.skipWhile(tok => tok.type !== 'space');
   * ```
   * @name .skipType
   * @param {String|Array} `types` One or more token types to skip.
   * @returns {Array} Returns an array if skipped tokens.
   * @api public
   */

  skipWhile(fn) {
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
   * @param {String|Array} `types` One or more token types to skip.
   * @returns {Array} Returns an array if skipped tokens.
   * @api public
   */

  skipTo(type) {
    return this.skipWhile(tok => tok.type !== type).concat(this.next());
  }

  /**
   * Skip the given token `types`.
   *
   * ```js
   * lexer.skipType('space');
   * lexer.skipType(['newline', 'space']);
   * ```
   * @name .skipType
   * @param {String|Array} `types` One or more token types to skip.
   * @returns {Array} Returns an array if skipped tokens
   * @api public
   */

  skipType(types) {
    return this.skipWhile(tok => ~arrayify(types).indexOf(tok.type));
  }

  /**
   * Pushes the given `value` onto `lexer.stash`.
   *
   * ```js
   * lexer.append('abc');
   * lexer.append('/');
   * lexer.append('*');
   * lexer.append('.');
   * lexer.append('js');
   * console.log(lexer.stash);
   * //=> ['abc', '/', '*', '.', 'js']
   * ```
   * @name .append
   * @emits append
   * @param {any} `value`
   * @return {Object} Returns the Lexer instance.
   * @api public
   */

  append(value, enqueue) {
    if (!value) return;
    if (this.stash.last() === '') {
      this.stash.append(value);
    } else {
      this.stash.push(value);
    }
    this.emit('append', value);
    return this;
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
   * @param {Object|String} `token`
   * @return {Object} Returns the given `token`.
   * @api public
   */

  push(token) {
    if (!token) return;
    if (this.options.mode !== 'character') {
      assert(this.isToken(token), 'expected token to be an instance of Token');
    }

    this.emit('push', token);
    this.tokens.push(token);

    if (this.options.append !== false && token.append !== false) {
      this.append(this.value(token));
    }
    return token;
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
   * @param {String} `type` The type to check for.
   * @return {Boolean}
   * @api public
   */

  isInside(type) {
    const last = this.stack.last();
    return this.isToken(last) && last.type === type;
  }

  /**
   * Returns the value of a token using the property defined on `lexer.options.value`
   * or `token.value`.
   *
   * @name .value
   * @return {String|undefined}
   * @api public
   */

  value(token) {
    return token[this.options.value || 'value'];
  }

  /**
   * Returns true if `lexer.string` and `lexer.queue` are empty.
   *
   * @name .eos
   * @return {Boolean}
   * @api public
   */

  eos() {
    return this.string.length === 0 && this.queue.length === 0;
  }

  /**
   * Creates a new Lexer instance with the given options, and copy
   * the handlers from the current instance to the new instance.
   *
   * @param {Object} `options`
   * @param {Object} `parent` Optionally pass a different lexer instance to copy handlers from.
   * @return {Object} Returns a new Lexer instance
   * @api public
   */

  create(options, parent = this) {
    const lexer = new this.constructor(options);
    lexer.handlers = parent.handlers;
    lexer.types = parent.types;
    return lexer;
  }

  /**
   * Throw a formatted error message with details including the cursor position.
   *
   * ```js
   * lexer.set('foo', function(tok) {
   *   if (tok.value !== 'foo') {
   *     throw this.error('expected token.value to be "foo"', tok);
   *   }
   * });
   * ```
   * @name .error
   * @param {String} `msg` Message to use in the Error.
   * @param {Object} `node`
   * @return {undefined}
   * @api public
   */

  error(err) {
    if (typeof err === 'string') err = new Error(err);
    if (this.hasListeners('error')) {
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
    if (this.stack.length) {
      const last = this.stack.last();
      const val = last.match ? last.match[0] : last[this.options.value || 'value'];
      this.error(new Error(`unclosed: "${val}"`));
    }
    if (this.string) {
      this.error(new Error(`unmatched input: "${this.string.slice(0, 10)}"`));
    }
  }

  /**
   * Get or set the `Stack` constructor to use for initializing Lexer stacks.
   * @name .Stack
   * @api private
   */

  get Stack() {
    return this.options.Stack || Lexer.Stack;
  }

  /**
   * Get or set the `Token` constructor to use when calling `lexer.token()`.
   * @name .Token
   * @api private
   */

  get Token() {
    return this.options.Token || Lexer.Token;
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
   * @param {Object} `lexer`
   * @returns {Boolean}
   * @api public
   * @static
   */

  static isLexer(lexer) {
    return lexer && lexer.isLexer === true;
  }

  /**
   * Static method for getting or setting the `Stack` constructor.
   *
   * @name Lexer#Stack
   * @api public
   * @static
   */

  static set Stack(Ctor) {
    Stack = Ctor;
  }
  static get Stack() {
    return Stack;
  }

  /**
   * Static method for getting or setting the `Token` constructor, used
   * by `lexer.token()` to create a new token.
   *
   * @name Lexer#Token
   * @api public
   * @static
   */

  static set Token(Ctor) {
    Token = Ctor;
  }
  static get Token() {
    return Token;
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
   * @param {Object} `lexer`
   * @returns {Boolean}
   * @api public
   * @static
   */

  static isToken(token) {
    return this.Token.isToken(token);
  }
};

function arrayify(value) {
  return Array.isArray(value) ? value : [value];
}

function define(obj, key, value) {
  Reflect.defineProperty(obj, key, { configurable: false, writable: false, value: value });
}

function isString(input) {
  return input && typeof input === 'string';
}

/**
 * Expose `Lexer`
 * @type {Function}
 */

module.exports = Lexer;
