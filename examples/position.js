/**
 * Example of using the "snapdragon-position" plugin for
 * adding start and end position to tokens
 */

const position = require('snapdragon-position');
const Tokenizer = require('..');
const tokenizer = new Tokenizer('foo/*');
tokenizer.use(position());

tokenizer.capture('slash', /^\//);
tokenizer.capture('text', /^\w+/);
tokenizer.capture('star', /^\*/);

console.log(tokenizer.advance());
console.log(tokenizer.advance());
console.log(tokenizer.advance());
