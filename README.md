# snapdragon-lexer [![NPM version](https://img.shields.io/npm/v/snapdragon-lexer.svg?style=flat)](https://www.npmjs.com/package/snapdragon-lexer) [![NPM monthly downloads](https://img.shields.io/npm/dm/snapdragon-lexer.svg?style=flat)](https://npmjs.org/package/snapdragon-lexer) [![NPM total downloads](https://img.shields.io/npm/dt/snapdragon-lexer.svg?style=flat)](https://npmjs.org/package/snapdragon-lexer) [![Linux Build Status](https://img.shields.io/travis/here-be-snapdragons/snapdragon-lexer.svg?style=flat&label=Travis)](https://travis-ci.org/here-be-snapdragons/snapdragon-lexer)

> Converts a string into an array of tokens, with useful methods for looking ahead and behind, capturing, matching, et cetera.

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save snapdragon-lexer
```

## Usage

```js
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer();

lexer.capture('slash', /^\//);
lexer.capture('text', /^\w+/);
lexer.capture('star', /^\*/);

console.log(lexer.tokenize('foo/*'));
```

## API

### [Lexer](index.js#L26)

Create a new `Lexer` with the given `options`.

**Params**

* `input` **{String|Object}**: (optional) Input string or options. You can also set input directly on `lexer.input` after initializing.
* `options` **{Object}**

**Example**

```js
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer('foo/bar');
```

### [.token](index.js#L72)

Create a new [Token](https://github.com/here-be-snapdragons/snapdragon-token) with the given `type` and `val`.

**Params**

* `type` **{String|Object}**: (required) The type of token to create
* `val` **{String}**: (optional) The captured string
* `match` **{Array}**: (optional) Match arguments returned from `String.match` or `RegExp.exec`
* `returns` **{Object}**: Returns an instance of [snapdragon-token](https://github.com/here-be-snapdragons/snapdragon-token)

**Events**

* `emits`: token

**Example**

```js
console.log(lexer.token({type: 'star', val: '*'}));
console.log(lexer.token('star', '*'));
console.log(lexer.token('star'));
```

### [.isToken](index.js#L92)

Returns true if the given value is a [snapdragon-token](https://github.com/here-be-snapdragons/snapdragon-token) instance.

**Params**

* `token` **{Object}**
* `returns` **{Boolean}**

**Example**

```js
const Token = require('snapdragon-token');
lexer.isToken({}); // false
lexer.isToken(new Token({type: 'star', val: '*'})); // true
```

### [.set](index.js#L114)

Register a lexer handler function for creating tokens by matching substrings of the given `type.`

**Params**

* `type` **{String}**
* `fn` **{Function}**: The handler function to register.

**Example**

```js
lexer.set('star', function() {
  const match = this.match(regex, type);
  if (match) {
    return this.token({val: match[0]}, match);
  }
});
```

### [.get](index.js#L139)

Get the registered lexer handler function of the given `type`. If a handler is not found, an error is thrown.

**Params**

* `type` **{String}**
* `fn` **{Function}**: The handler function to register.

**Example**

```js
const handler = lexer.get('text');
```

### [.consume](index.js#L159)

Removes the given `string` from the beginning of `lexer.string` and adds it to the end of `lexer.consumed`, then updates `lexer.line` and `lexer.column` with the current cursor position.

**Params**

* `string` **{String}**
* `returns` **{Object}**: Returns the instance for chaining.

**Example**

```js
lexer.consume('*');
```

### [.match](index.js#L203)

Capture a substring from `lexer.string` with the given `regex`. Also validates the regex to ensure that it starts with `^` since matching should always be against the beginning of the string, and throws if the regex matches an empty string, which can cause catastrophic backtracking in some cases.

**Params**

* `regex` **{RegExp}**: (required)
* `returns` **{Array}**: Returns the match arguments from `RegExp.exec` or null.

**Example**

```js
const lexer = new Lexer('foo/bar');
const match = lexer.match(/^\w+/);
console.log(match);
//=> [ 'foo', index: 0, input: 'foo/bar' ]
```

### [.scan](index.js#L243)

Scan for a matching substring by calling [.match()](#match) with the given `regex`. If a match is found, 1) a token of the specified `type` is created, 2) `match[0]` is used as `token.value`, and 3) the length of `match[0]` is sliced from `lexer.string` (by calling [.consume()](#consume)).

**Params**

* `type` **{String}**
* `regex` **{RegExp}**
* `returns` **{Object}**: Returns a token if a match is found, otherwise undefined.

**Events**

* `emits`: scan

**Example**

```js
lexer.string = '/foo/';
console.log(lexer.scan(/^\//, 'slash'));
//=> Token { type: 'slash', val: '/' }
console.log(lexer.scan(/^\w+/, 'text'));
//=> Token { type: 'text', val: 'foo' }
console.log(lexer.scan(/^\//, 'slash'));
//=> Token { type: 'slash', val: '/' }
```

### [.capture](index.js#L280)

Capture a token of the specified `type` using the provide `regex` for scanning and matching substrings. When [.tokenize](#tokenize) is use, captured tokens are pushed onto the `lexer.tokens` array.

**Params**

* `type` **{String}**: (required) The type of token being captured.
* `regex` **{RegExp}**: (required) The regex for matching substrings.
* `fn` **{Function}**: (optional) If supplied, the function will be called on the token before pushing it onto `lexer.tokens`.
* `returns` **{Object}**

**Example**

```js
lexer.capture('text', /^\w+/);
lexer.capture('text', /^\w+/, tok => {
  if (tok.match[1] === 'foo') {
    // do stuff
  }
  return tok;
});
```

### [.lex](index.js#L311)

Calls handler `type` on `lexer.string`.

**Params**

* `type` **{String}**: The handler type to call on `lexer.string`
* `returns` **{Object}**: Returns a token of the given `type` or undefined.

**Events**

* `emits`: lex

**Example**

```js
const lexer = new Lexer('/a/b');
lexer.capture('slash', /^\//);
lexer.capture('text', /^\w+/);
console.log(lexer.lex('text'));
//=> undefined
console.log(lexer.lex('slash'));
//=> { type: 'slash', val: '/' }
console.log(lexer.lex('text'));
//=> { type: 'text', val: 'a' }
```

### [.advance](index.js#L333)

Get the next token by iterating over `lexer.handlers` and calling each handler on `lexer.string` until a handler returns a token. If no handlers return a token, an error is thrown with the substring that couldn't be lexed.

* `returns` **{Object}**: Returns the first token returned by a handler.

**Example**

```js
const token = lexer.advance();
```

### [.tokenize](index.js#L365)

Tokenizes a string and returns an array of tokens.

**Params**

* `input` **{String}**: The string to tokenize.
* `returns` **{Array}**: Returns an array of tokens.

**Example**

```js
lexer.capture('slash', /^\//);
lexer.capture('text', /^\w+/);
const tokens = lexer.tokenize('a/b/c');
console.log(tokens);
// Results in:
// [ Token { type: 'text', val: 'a' },
//   Token { type: 'slash', val: '/' },
//   Token { type: 'text', val: 'b' },
//   Token { type: 'slash', val: '/' },
//   Token { type: 'text', val: 'c' } ]
```

### [.enqueue](index.js#L385)

Push a token onto the `lexer.queue` array.

**Params**

* `token` **{Object}**
* `returns` **{Object}**: Returns the given token with updated `token.index`.

**Example**

```js
console.log(lexer.queue.length); // 0
lexer.enqueue(new Token('star', '*'));
console.log(lexer.queue.length); // 1
```

### [.dequeue](index.js#L403)

Shift a token from `lexer.queue`.

* `returns` **{Object}**: Returns the given token with updated `token.index`.

**Example**

```js
console.log(lexer.queue.length); // 1
lexer.dequeue();
console.log(lexer.queue.length); // 0
```

### [.lookbehind](index.js#L419)

Lookbehind `n` tokens.

**Params**

* `n` **{Number}**
* `returns` **{Object}**

**Example**

```js
const token = lexer.lookbehind(2);
```

### [.current](index.js#L435)

Get the current token.

* `returns` **{Object}**: Returns a token.

**Example**

```js
const token = lexer.current();
```

### [.prev](index.js#L450)

Get the previous token.

* `returns` **{Object}**: Returns a token.

**Example**

```js
const token = lexer.prev();
```

### [.lookahead](index.js#L468)

Lookahead `n` tokens and return the last token. Pushes any intermediate tokens onto `lexer.tokens.` To lookahead a single token, use [.peek()](#peek).

**Params**

* `n` **{Number}**
* `returns` **{Object}**

**Example**

```js
const token = lexer.lookahead(2);
```

### [.peek](index.js#L486)

Lookahead a single token.

* `returns` **{Object}** `token`

**Example**

```js
const token = lexer.peek();
```

### [.next](index.js#L501)

Get the next token, either from the `queue` or by [advancing](#advance).

* `returns` **{Object}**: Returns a token.

**Example**

```js
const token = lexer.next();
```

### [.skip](index.js#L517)

Skip `n` tokens. Skipped tokens are not enqueued.

**Params**

* `n` **{Number}**
* `returns` **{Object}**: returns the very last lexed/skipped token.

**Example**

```js
const token = lexer.skip(1);
```

### [.skipType](index.js#L537)

Skip the given token `types`.

**Params**

* `types` **{String|Array}**: One or more token types to skip.
* `returns` **{Array}**: Returns an array if skipped tokens

**Example**

```js
lexer.skipType('space');
lexer.skipType(['newline', 'space']);
```

### [.push](index.js#L560)

Push a token onto `lexer.tokens`.

**Params**

* `token` **{Object}**
* `returns` **{Object}**: Returns the given token with updated `token.index`.

**Events**

* `emits`: push

**Example**

```js
console.log(lexer.tokens.length); // 0
lexer.push(new Token('star', '*'));
console.log(lexer.tokens.length); // 1
```

### [.eos](index.js#L577)

Returns true when the end-of-string has been reached, and
`lexer.queue` is empty.

* `returns` **{Boolean}**

### [.error](index.js#L611)

Throw a formatted error message with details including the cursor position.

**Params**

* `msg` **{String}**: Message to use in the Error.
* `node` **{Object}**
* `returns` **{undefined}**

**Example**

```js
parser.set('foo', function(tok) {
  if (tok.val !== 'foo') {
    throw this.error('expected token.val to be "foo"', tok);
  }
});
```

### [Lexer#isLexer](index.js#L639)

Static method that returns true if the given value is an instance of `snapdragon-lexer`.

**Params**

* `lexer` **{Object}**
* `returns` **{Boolean}**

**Example**

```js
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer();
console.log(Lexer.isLexer(lexer)); //=> true
console.log(Lexer.isLexer({})); //=> false
```

### [Lexer#isToken](index.js#L660)

Static method that returns true if the given value is an instance of `snapdragon-token`. This is a proxy to `Token#isToken`.

**Params**

* `lexer` **{Object}**
* `returns` **{Boolean}**

**Example**

```js
const Token = require('snapdragon-token');
const Lexer = require('snapdragon-lexer');
console.log(Lexer.isToken(new Token({type: 'foo'}))); //=> true
console.log(Lexer.isToken({})); //=> false
```

## Plugins

Pass plugins to the `lexer.use()` method.

**Example**

The [snapdragon-position](https://github.com/here-be-snapdragons/snapdragon-position) plugin adds a `position` property with line and column to tokens as they're created:

```js
const position = require('snapdragon-position');
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer();

lexer.use(position());
lexer.capture('slash', /^\//);
lexer.capture('text', /^\w+/);
lexer.capture('star', /^\*/);

// "advance" captures a single token
console.log(lexer.advance());
console.log(lexer.advance());
console.log(lexer.advance());
```

Results in:

```js
Token {
  type: 'text',
  val: 'foo',
  match: [ 'foo', index: 0, input: 'foo/*' ],
  position: {
    start: { index: 0, column: 1, line: 1 },
    end: { index: 3, column: 4, line: 1 } 
  } 
}

Token {
  type: 'slash',
  val: '/',
  match: [ '/', index: 0, input: '/*' ],
  position: {
    start: { index: 3, column: 4, line: 1 },
    end: { index: 4, column: 5, line: 1 } 
  } 
}

Token {
  type: 'star',
  val: '*',
  match: [ '*', index: 0, input: '*' ],
  position: {
    start: { index: 4, column: 5, line: 1 },
    end: { index: 5, column: 6, line: 1 } 
  } 
}
```

### Plugin Conventions

Plugins are just functions that take an instance of snapdragon-lexer. However, it's recommended that you wrap your plugin function in a function that takes an options object, to allow users to pass options when using the plugin. _Even if your plugin doesn't take options, it's a best practice for users to always be able to use the same signature_.

**Example**

```js
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer();

function yourPlugin(options) {
  return function(lexer) {
    // do stuff to lexer
  };
}

lexer.use(yourPlugin());
```

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Related projects

You might also be interested in these projects:

* [snapdragon-node](https://www.npmjs.com/package/snapdragon-node): Snapdragon utility for creating a new AST node in custom code, such as plugins. | [homepage](https://github.com/jonschlinkert/snapdragon-node "Snapdragon utility for creating a new AST node in custom code, such as plugins.")
* [snapdragon-position](https://www.npmjs.com/package/snapdragon-position): Snapdragon util and plugin for patching the position on an AST node. | [homepage](https://github.com/here-be-snapdragons/snapdragon-position "Snapdragon util and plugin for patching the position on an AST node.")
* [snapdragon-token](https://www.npmjs.com/package/snapdragon-token): Create a snapdragon token. Used by the snapdragon lexer, but can also be used by… [more](https://github.com/here-be-snapdragons/snapdragon-token) | [homepage](https://github.com/here-be-snapdragons/snapdragon-token "Create a snapdragon token. Used by the snapdragon lexer, but can also be used by plugins.")

### Author

**Jon Schlinkert**

* [linkedin/in/jonschlinkert](https://linkedin.com/in/jonschlinkert)
* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2017, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on November 30, 2017._