/**
 * Example of using the .match method
 */

const Tokenizer = require('..');
const tokenizer = new Tokenizer('foo/bar');
tokenizer.use(position());

const match = tokenizer.match(/^\w+/);
const tok = tokenizer.token('text', match[0], match);
console.log(tok);
