/**
 * Example of using the .match method
 */

const position = require('snapdragon-position');
const Tokenizer = require('..');
const tokenizer = new Tokenizer('foo/bar');
tokenizer.use(position());

const pos = tokenizer.position();
const match = tokenizer.match(/^\w+/);
const tok = pos(tokenizer.token('text', match[0], match));
console.log(tok);
