# snapdragon-lexer [![NPM version](https://img.shields.io/npm/v/snapdragon-lexer.svg?style=flat)](https://www.npmjs.com/package/snapdragon-lexer) [![NPM monthly downloads](https://img.shields.io/npm/dm/snapdragon-lexer.svg?style=flat)](https://npmjs.org/package/snapdragon-lexer) [![NPM total downloads](https://img.shields.io/npm/dt/snapdragon-lexer.svg?style=flat)](https://npmjs.org/package/snapdragon-lexer) [![Linux Build Status](https://img.shields.io/travis/here-be/snapdragon-lexer.svg?style=flat&label=Travis)](https://travis-ci.org/here-be/snapdragon-lexer)

> Converts a string into an array of tokens, with useful methods for looking ahead and behind, capturing, matching, et cetera.

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Table of Contents

<details>
<summary><strong>Details</strong></summary>

- [Install](#install)
- [Breaking changes in v2.0!](#breaking-changes-in-v20)
- [Usage](#usage)
- [API](#api)
  * [.set](#set)
  * [.get](#get)
- [Properties](#properties)
  * [lexer.isLexer](#lexerislexer)
  * [lexer.input](#lexerinput)
  * [lexer.string](#lexerstring)
  * [lexer.consumed](#lexerconsumed)
  * [lexer.tokens](#lexertokens)
  * [lexer.stash](#lexerstash)
  * [lexer.stack](#lexerstack)
  * [lexer.queue](#lexerqueue)
  * [lexer.loc](#lexerloc)
- [Options](#options)
  * [options.source](#optionssource)
  * [options.mode](#optionsmode)
  * [options.value](#optionsvalue)
- [Tokens](#tokens)
- [Plugins](#plugins)
  * [Plugin Conventions](#plugin-conventions)
- [About](#about)

</details>

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save snapdragon-lexer
```

## Breaking changes in v2.0!

Please see the [changelog](CHANGELOG.md) for details!

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

### [Lexer](index.js#L27)

Create a new `Lexer` with the given `options`.

**Params**

* `input` **{String|Object}**: (optional) Input string or options. You can also set input directly on `lexer.input` after initializing.
* `options` **{Object}**

**Example**

```js
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer('foo/bar');
```

### [.token](index.js#L88)

Create a new [Token](https://github.com/here-be/snapdragon-token) with the given `type` and `value`.

**Params**

* `type` **{String|Object}**: (required) The type of token to create
* `value` **{String}**: (optional) The captured string
* `match` **{Array}**: (optional) Match arguments returned from `String.match` or `RegExp.exec`
* `returns` **{Object}**: Returns an instance of [snapdragon-token](https://github.com/here-be/snapdragon-token)

**Events**

* `emits`: token

**Example**

```js
console.log(lexer.token({type: 'star', value: '*'}));
console.log(lexer.token('star', '*'));
console.log(lexer.token('star'));
```

### [.isToken](index.js#L108)

Returns true if the given value is a [snapdragon-token](https://github.com/here-be/snapdragon-token) instance.

**Params**

* `token` **{Object}**
* `returns` **{Boolean}**

**Example**

```js
const Token = require('snapdragon-token');
lexer.isToken({}); // false
lexer.isToken(new Token({type: 'star', value: '*'})); // true
```

### [.consume](index.js#L127)

Consume the given length from `lexer.string`. The consumed value is used to update `lexer.consumed`, as well as the current position.

**Params**

* `len` **{Number}**
* `value` **{String}**: Optionally pass the value being consumed.
* `returns` **{String}**: Returns the consumed value

**Example**

```js
lexer.consume(1);
lexer.consume(1, '*');
```

### [.match](index.js#L167)

Use the given `regex` to match a substring from `lexer.string`. Also validates the regex to ensure that it starts with `^` since matching should always be against the beginning of the string, and throws if the regex matches an empty string, which can cause catastrophic backtracking.

**Params**

* `regex` **{RegExp}**: (required)
* `returns` **{Array|null}**: Returns the match array from `RegExp.exec` or null.

**Example**

```js
const lexer = new Lexer('foo/bar');
const match = lexer.match(/^\w+/);
console.log(match);
//=> [ 'foo', index: 0, input: 'foo/bar' ]
```

### [.scan](index.js#L211)

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
//=> Token { type: 'slash', value: '/' }
console.log(lexer.scan(/^\w+/, 'text'));
//=> Token { type: 'text', value: 'foo' }
console.log(lexer.scan(/^\//, 'slash'));
//=> Token { type: 'slash', value: '/' }
```

### [.capture](index.js#L247)

Capture a token of the specified `type` using the provide `regex` for scanning and matching substrings. Automatically registers a handler when a function is passed as the last argument.

**Params**

* `type` **{String}**: (required) The type of token being captured.
* `regex` **{RegExp}**: (required) The regex for matching substrings.
* `fn` **{Function}**: (optional) If supplied, the function will be called on the token before pushing it onto `lexer.tokens`.
* `returns` **{Object}**

**Example**

```js
lexer.capture('text', /^\w+/);
lexer.capture('text', /^\w+/, token => {
  if (token.value === 'foo') {
    // do stuff
  }
  return token;
});
```

### [.handle](index.js#L278)

Calls handler `type` on `lexer.string`.

**Params**

* `type` **{String}**: The handler type to call on `lexer.string`
* `returns` **{Object}**: Returns a token of the given `type` or undefined.

**Events**

* `emits`: handle

**Example**

```js
const lexer = new Lexer('/a/b');
lexer.capture('slash', /^\//);
lexer.capture('text', /^\w+/);
console.log(lexer.handle('text'));
//=> undefined
console.log(lexer.handle('slash'));
//=> { type: 'slash', value: '/' }
console.log(lexer.handle('text'));
//=> { type: 'text', value: 'a' }
```

### [.advance](index.js#L301)

Get the next token by iterating over `lexer.handlers` and calling each handler on `lexer.string` until a handler returns a token. If no handlers return a token, an error is thrown with the substring that couldn't be lexed.

* `returns` **{Object}**: Returns the first token returned by a handler, or the first character in the remaining string if `options.mode` is set to `character`.

**Example**

```js
const token = lexer.advance();
```

### [.tokenize](index.js#L336)

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
// [ Token { type: 'text', value: 'a' },
//   Token { type: 'slash', value: '/' },
//   Token { type: 'text', value: 'b' },
//   Token { type: 'slash', value: '/' },
//   Token { type: 'text', value: 'c' } ]
```

### [.enqueue](index.js#L356)

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

### [.dequeue](index.js#L375)

Shift a token from `lexer.queue`.

* `returns` **{Object}**: Returns the given token with updated `token.index`.

**Example**

```js
console.log(lexer.queue.length); // 1
lexer.dequeue();
console.log(lexer.queue.length); // 0
```

### [.lookbehind](index.js#L391)

Lookbehind `n` tokens.

**Params**

* `n` **{Number}**
* `returns` **{Object}**

**Example**

```js
const token = lexer.lookbehind(2);
```

### [.prev](index.js#L406)

Get the previous token.

* `returns` **{Object}**: Returns a token.

**Example**

```js
const token = lexer.prev();
```

### [.lookahead](index.js#L424)

Lookahead `n` tokens and return the last token. Pushes any intermediate tokens onto `lexer.tokens.` To lookahead a single token, use [.peek()](#peek).

**Params**

* `n` **{Number}**
* `returns` **{Object}**

**Example**

```js
const token = lexer.lookahead(2);
```

### [.peek](index.js#L442)

Lookahead a single token.

* `returns` **{Object}** `token`

**Example**

```js
const token = lexer.peek();
```

### [.next](index.js#L457)

Get the next token, either from the `queue` or by [advancing](#advance).

* `returns` **{Object|String}**: Returns a token, or (when `options.mode` is set to `character`) either gets the next character from `lexer.queue`, or consumes the next charcter in the string.

**Example**

```js
const token = lexer.next();
```

### [.skip](index.js#L473)

Skip `n` tokens or characters in the string. Skipped values are not enqueued.

**Params**

* `n` **{Number}**
* `returns` **{Object}**: returns the very last lexed/skipped token.

**Example**

```js
const token = lexer.skip(1);
```

### [.skipType](index.js#L490)

Skip the given token `types`.

**Params**

* `types` **{String|Array}**: One or more token types to skip.
* `returns` **{Array}**: Returns an array if skipped tokens.

**Example**

```js
lexer.skipWhile(tok => tok.type !== 'space');
```

### [.skipType](index.js#L508)

Skip the given token `types`.

**Params**

* `types` **{String|Array}**: One or more token types to skip.
* `returns` **{Array}**: Returns an array if skipped tokens.

**Example**

```js
lexer.skipWhile(tok => tok.type !== 'space');
```

### [.skipType](index.js#L525)

Skip the given token `types`.

**Params**

* `types` **{String|Array}**: One or more token types to skip.
* `returns` **{Array}**: Returns an array if skipped tokens

**Example**

```js
lexer.skipType('space');
lexer.skipType(['newline', 'space']);
```

### [.append](index.js#L548)

Pushes the given `value` onto `lexer.stash`.

**Params**

* `value` **{any}**
* `returns` **{Object}**: Returns the Lexer instance.

**Events**

* `emits`: append

**Example**

```js
lexer.append('abc');
lexer.append('/');
lexer.append('*');
lexer.append('.');
lexer.append('js');
console.log(lexer.stash);
//=> ['abc', '/', '*', '.', 'js']
```

### [.push](index.js#L577)

Pushes the given `token` onto `lexer.tokens` and calls [.append()](#append) to push `token.value` onto `lexer.stash`. Disable pushing onto the stash by setting `lexer.options.append` or `token.append` to `false`.

**Params**

* `token` **{Object|String}**
* `returns` **{Object}**: Returns the given `token`.

**Events**

* `emits`: push

**Example**

```js
console.log(lexer.tokens.length); // 0
lexer.push(new Token('star', '*'));
console.log(lexer.tokens.length); // 1
console.log(lexer.stash) // ['*']
```

### [.isInside](index.js#L606)

Returns true if a token with the given `type` is on the stack.

**Params**

* `type` **{String}**: The type to check for.
* `returns` **{Boolean}**

**Example**

```js
if (lexer.isInside('bracket') || lexer.isInside('brace')) {
  // do stuff
}
```

### [.value](index.js#L620)

Returns the value of a token using the property defined on `lexer.options.value`
or `token.value`.

* `returns` **{String|undefined}**

### [.eos](index.js#L632)

Returns true if `lexer.string` and `lexer.queue` are empty.

* `returns` **{Boolean}**

Creates a new Lexer instance with the given options, and copy
the handlers from the current instance to the new instance.

**Params**

* `options` **{Object}**
* `parent` **{Object}**: Optionally pass a different lexer instance to copy handlers from.
* `returns` **{Object}**: Returns a new Lexer instance

### [.error](index.js#L670)

Throw a formatted error message with details including the cursor position.

**Params**

* `msg` **{String}**: Message to use in the Error.
* `node` **{Object}**
* `returns` **{undefined}**

**Example**

```js
lexer.set('foo', function(tok) {
  if (tok.value !== 'foo') {
    throw this.error('expected token.value to be "foo"', tok);
  }
});
```

### [Lexer#isLexer](index.js#L733)

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

### [Lexer#Stack](index.js#L745)

Static method for getting or setting the `Stack` constructor.

### [Lexer#Token](index.js#L761)

Static method for getting or setting the `Token` constructor, used
by `lexer.token()` to create a new token.

### [Lexer#isToken](index.js#L785)

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

### .set

Register a handler function.

**Params**

* `type` **{String}**
* `fn` **{Function}**: The handler function to register.

**Example**

```js
lexer.set('star', function(token) {
  // do parser, lexer, or compiler stuff
});
```

As an alternative to `.set`, the [.capture](#capture) method will automatically register a handler when a function is passed as the last argument.

### .get

Get a registered handler function.

**Params**

* `type` **{String}**
* `fn` **{Function}**: The handler function to register.

**Example**

```js
lexer.set('star', function() {
  // do parser, lexer, or compiler stuff
});
const star = handlers.get('star');
```

## Properties

### lexer.isLexer

Type: **{boolean}**

Default: `true` (contant)

This property is defined as a convenience, to make it easy for plugins to check for an instance of Lexer.

### lexer.input

Type: **{string}**

Default: `''`

The unmodified source string provided by the user.

### lexer.string

Type: **{string}**

Default: `''`

The source string minus the part of the string that has already been [consumed](#consume).

### lexer.consumed

Type: **{string}**

Default: `''`

The part of the source string that has been consumed.

### lexer.tokens

Type: **{array}**

Default: `[]

Array of lexed tokens.

### lexer.stash

Type: **{array}**

Default: `['']` (instance of [snapdragon-stack](https://github.com/here-be/snapdragon-stack))

Array of captured strings. Similar to the [lexer.tokens](#lexertokens) array, but stores strings instead of token objects.

### lexer.stack

Type: **{array}**

Default: `[]

LIFO (last in, first out) array. A token is pushed onto the stack when an "opening" character or character sequence needs to be tracked. When the (matching) "closing" character or character sequence is encountered, the (opening) token is popped off of the stack.

The stack is not used by any lexer methods, it's reserved for the user. Stacks are necessary for creating Abstract Syntax Trees (ASTs), but if you require this functionality it would be better to use a parser such as [snapdragon-parser][snapdragon-parser], with methods and other conveniences for creating an AST.

### lexer.queue

Type: **{array}**

Default: `[]

FIFO (first in, first out) array, for temporarily storing tokens that are created when [.lookahead()](#lookahead) is called (or a method that calls `.lookhead()`, such as [.peek()](#peek)).

Tokens are [dequeued](#dequeue) when [.next()](#next) is called.

### lexer.loc

Type: **{Object}**

Default: `{ index: 0, column: 0, line: 1 }`

The updated source string location with the following properties.

* `index` - 0-index
* `column` - 0-index
* `line` - 1-index

The following plugins are available for automatically updating tokens with the location:

* [snapdragon-location](https://github.com/here-be/snapdragon-location)
* [snapdragon-position](https://github.com/here-be/snapdragon-position)

## Options

### options.source

Type: **{string}**

Default: `undefined`

The source of the input string. This is typically a filename or file path, but can also be `'string'` if a string or buffer is provided directly.

If `lexer.input` is undefined, and `options.source` is a string, the lexer will attempt to set `lexer.input` by calling `fs.readFileSync()` on the value provided on `options.source`.

### options.mode

Type: **{string}**

Default: `undefined`

If `options.mode` is `character`, instead of calling handlers (which match using regex) the [.advance()](advance) method will [consume](#consume) and return one character at a time.

### options.value

Type: **{string}**

Default: `undefined`

Specify the token property to use when the [.push](#push) method pushes a value onto [lexer.stash](#lexerstash). The logic works something like this:

```js
lexer.append(token[lexer.options.value || 'value']);
```

## Tokens

See the [snapdragon-token](https://github.com/here-be/snapdragon-token) documentation for more details.

## Plugins

Plugins are registered with the `lexer.use()` method and use the following conventions.

### Plugin Conventions

Plugins are functions that take an instance of snapdragon-lexer.

However, it's recommended that you always wrap your plugin function in another function that takes an options object. This allow users to pass options when using the plugin. _Even if your plugin doesn't take options, it's a best practice for users to always be able to use the same signature_.

**Example**

```js
function plugin(options) {
  return function(lexer) {
    // do stuff 
  };
}

lexer.use(plugin());
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
* [snapdragon-position](https://www.npmjs.com/package/snapdragon-position): Snapdragon util and plugin for patching the position on an AST node. | [homepage](https://github.com/here-be/snapdragon-position "Snapdragon util and plugin for patching the position on an AST node.")
* [snapdragon-token](https://www.npmjs.com/package/snapdragon-token): Create a snapdragon token. Used by the snapdragon lexer, but can also be used by… [more](https://github.com/here-be/snapdragon-token) | [homepage](https://github.com/here-be/snapdragon-token "Create a snapdragon token. Used by the snapdragon lexer, but can also be used by plugins.")

### Author

**Jon Schlinkert**

* [linkedin/in/jonschlinkert](https://linkedin.com/in/jonschlinkert)
* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2018, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on February 16, 2018._