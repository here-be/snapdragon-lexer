'use strict';

/**
 * Module dependencies
 */

const assert = require('assert');
const Token = require('snapdragon-token');
const Emitter = require('@sellside/emitter');
const union = require('union-value');
const use = require('use');

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

class Lexer extends Emitter {
  constructor(input, options) {
    super();

    if (typeof input !== 'string') {
      return new Lexer('', input);
    }

    Reflect.defineProperty(this, 'isLexer', { value: true });
    this.options = Object.assign({type: 'root', Token}, options);
    this.Token = this.options.Token;
    this.handlers = {};
    this.types = [];
    this.init(input);
    use(this);
  }

  /**
   * Initialize lexer state properties
   */

  init(input) {
    if (input) this.input = this.string = input;
    this.loc = { index: 0, column: 1, line: 1 };
    this.consumed = '';
    this.tokens = [];
    this.queue = [];
  }

  /**
   * Create a new [Token][snapdragon-token] with the given `type` and `val`.
   *
   * ```js
   * console.log(lexer.token({type: 'star', val: '*'}));
   * console.log(lexer.token('star', '*'));
   * console.log(lexer.token('star'));
   * ```
   * @name .token
   * @emits token
   * @param {String|Object} `type` (required) The type of token to create
   * @param {String} `val` (optional) The captured string
   * @param {Array} `match` (optional) Match arguments returned from `String.match` or `RegExp.exec`
   * @return {Object} Returns an instance of [snapdragon-token][]
   * @api public
   */

  token(type, val, match) {
    const token = new this.Token(type, val, match);
    this.emit('token', token);
    return token;
  }

  /**
   * Returns true if the given value is a [snapdragon-token][] instance.
   *
   * ```js
   * const Token = require('snapdragon-token');
   * lexer.isToken({}); // false
   * lexer.isToken(new Token({type: 'star', val: '*'})); // true
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
   * Register a lexer handler function for creating tokens by
   * matching substrings of the given `type.`
   *
   * ```js
   * lexer.set('star', function() {
   *   const match = this.match(regex, type);
   *   if (match) {
   *     return this.token({val: match[0]}, match);
   *   }
   * });
   * ```
   * @name .set
   * @param {String} `type`
   * @param {Function} `fn` The handler function to register.
   * @api public
   */

  set(type, handler) {
    // preserve order of registered handlers
    union(this, 'types', type);

    // late binding (doesn't work with fat arrows)
    const lexer = this;
    this.handlers[type] = function() {
      return handler.call(lexer);
    };
    return this;
  }

  /**
   * Get the registered lexer handler function of the given `type`.
   * If a handler is not found, an error is thrown.
   *
   * ```js
   * const handler = lexer.get('text');
   * ```
   * @name .get
   * @param {String} `type`
   * @param {Function} `fn` The handler function to register.
   * @api public
   */

  get(type) {
    const handler = this.handlers[type];
    assert.equal(typeof handler, 'function', 'expected a function');
    return handler;
  }

  /**
   * Removes the given `string` from the beginning of `lexer.string` and
   * adds it to the end of `lexer.consumed`, then updates `lexer.line`
   * and `lexer.column` with the current cursor position.
   *
   * ```js
   * lexer.consume('*');
   * ```
   * @name .consume
   * @param {String} `string`
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  consume(val, len = val.length) {
    assert(typeof val === 'string', 'expected a string');
    this.updateLocation(val, len);
    this.string = this.string.slice(len);
    this.consumed += val;
    return this;
  }

  /**
   * Update column and line number based on `val`.
   * @param {String} `val`
   * @return {Object} returns the instance for chaining.
   */

  updateLocation(val, len = val.length) {
    assert(typeof val === 'string', 'expected a string');
    const lines = val.match(/\n/g);
    if (lines) this.loc.line += lines.length;

    const index = val.lastIndexOf('\n');
    this.loc.column = ~index ? len - index : this.loc.column + len;
    this.loc.index += len;
    return this;
  }

  /**
   * Capture a substring from `lexer.string` with the given `regex`. Also
   * validates the regex to ensure that it starts with `^` since matching
   * should always be against the beginning of the string, and throws if
   * the regex matches an empty string, which can cause catastrophic
   * backtracking in some cases.
   *
   * ```js
   * const lexer = new Lexer('foo/bar');
   * const match = lexer.match(/^\w+/);
   * console.log(match);
   * //=> [ 'foo', index: 0, input: 'foo/bar' ]
   * ```
   * @name .match
   * @param {RegExp} `regex` (required)
   * @return {Array} Returns the match arguments from `RegExp.exec` or null.
   * @api public
   */

  match(regex) {
    if (regex.validated !== true) {
      assert(/^\^/.test(regex.source), 'expected regex to start with "^"');
      regex.validated = true;
    }

    const match = regex.exec(this.string);
    if (!match) return;
    if (match[0] === '') {
      throw new SyntaxError('regex should not match an empty string');
    }

    this.consume(match[0]);
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
   * //=> Token { type: 'slash', val: '/' }
   * console.log(lexer.scan(/^\w+/, 'text'));
   * //=> Token { type: 'text', val: 'foo' }
   * console.log(lexer.scan(/^\//, 'slash'));
   * //=> Token { type: 'slash', val: '/' }
   * ```
   * @name .scan
   * @emits scan
   * @param {String} `type`
   * @param {RegExp} `regex`
   * @return {Object} Returns a token if a match is found, otherwise undefined.
   * @api public
   */

  scan(regex, type) {
    const match = this.match(regex);
    if (!match) return;

    try {
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
   * for scanning and matching substrings. When [.tokenize](#tokenize) is
   * use, captured tokens are pushed onto the `lexer.tokens` array.
   *
   * ```js
   * lexer.capture('text', /^\w+/);
   * lexer.capture('text', /^\w+/, tok => {
   *   if (tok.match[1] === 'foo') {
   *     // do stuff
   *   }
   *   return tok;
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
   * console.log(lexer.lex('text'));
   * //=> undefined
   * console.log(lexer.lex('slash'));
   * //=> { type: 'slash', val: '/' }
   * console.log(lexer.lex('text'));
   * //=> { type: 'text', val: 'a' }
   * ```
   * @name .lex
   * @emits lex
   * @param {String} `type` The handler type to call on `lexer.string`
   * @return {Object} Returns a token of the given `type` or undefined.
   * @api public
   */

  lex(type) {
    const token = this.get(type).call(this);
    if (token) {
      this.emit('lex', token);
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
   * @return {Object} Returns the first token returned by a handler.
   * @api public
   */

  advance() {
    if (!this.string) return;
    for (var type of this.types) {
      var tok = this.lex(type);
      if (tok) {
        return tok;
      }
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
   * // [ Token { type: 'text', val: 'a' },
   * //   Token { type: 'slash', val: '/' },
   * //   Token { type: 'text', val: 'b' },
   * //   Token { type: 'slash', val: '/' },
   * //   Token { type: 'text', val: 'c' } ]
   * ```
   * @name .tokenize
   * @param {String} `input` The string to tokenize.
   * @return {Array} Returns an array of tokens.
   * @api public
   */

  tokenize(input) {
    this.init(input);
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
    if (token) this.queue.push(token);
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
    return this.queue.shift();
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
    assert.equal(typeof n, 'number', 'expected a number');
    return this.tokens[this.tokens.length - n];
  }

  /**
   * Get the current token.
   *
   * ```js
   * const token = lexer.current();
   * ```
   * @name .current
   * @returns {Object} Returns a token.
   * @api public
   */

  current() {
    return this.lookbehind(1);
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
    return this.lookbehind(2);
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
   * @returns {Object} Returns a token.
   * @api public
   */

  next() {
    return this.dequeue() || this.advance();
  }

  /**
   * Skip `n` tokens. Skipped tokens are not enqueued.
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
    let skipped = [], tok;
    while (n-- > 0 && (tok = this.next())) skipped.push(tok);
    return skipped;
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
    let skipped = [];
    while (~arrayify(types).indexOf(this.peek().type)) {
      skipped.push(this.dequeue());
    }
    return skipped;
  }

  /**
   * Push a token onto `lexer.tokens`.
   *
   * ```js
   * console.log(lexer.tokens.length); // 0
   * lexer.push(new Token('star', '*'));
   * console.log(lexer.tokens.length); // 1
   * ```
   * @name .push
   * @emits push
   * @param {Object} `token`
   * @return {Object} Returns the given token with updated `token.index`.
   * @api public
   */

  push(token) {
    if (!token) return;
    assert(this.isToken(token), 'expected token to be an instance of Token');
    this.emit('push', token);
    this.tokens.push(token);
    return token;
  }

  /**
   * Returns true when the end-of-string has been reached, and
   * `lexer.queue` is empty.
   *
   * @name .eos
   * @return {Boolean}
   * @api public
   */

  eos() {
    return this.string.length === 0 && this.queue.length === 0;
  }

  /**
   * Throws an error when the remaining string cannot be lexed
   * by the currently registered handlers.
   * @param {String} `type`
   * @api private
   */

  fail() {
    if (this.string) {
      this.error(new Error('unmatched input: ' + this.string));
    }
  }

  /**
   * Throw a formatted error message with details including the cursor position.
   *
   * ```js
   * parser.set('foo', function(tok) {
   *   if (tok.val !== 'foo') {
   *     throw this.error('expected token.val to be "foo"', tok);
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
    if (typeof err === 'string') {
      err = new Error(err);
    }
    if (this.emit && this.hasListeners('error')) {
      this.emit('error', err);
    } else {
      throw err;
    }
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

function arrayify(val) {
  return val != null ? (Array.isArray(val) ? val : [val]) : [];
}

/**
 * Expose `Lexer`
 * @type {Function}
 */

module.exports = Lexer;
