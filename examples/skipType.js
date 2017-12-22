/**
 * Example of using the .skipType method
 */

const Tokenizer = require('..');
const tokenizer = new Tokenizer('foo/*');

tokenizer.capture('slash', /^\//);
tokenizer.capture('text', /^\w+/);
tokenizer.capture('star', /^\*/);

tokenizer.skipType(['slash', 'text']);
console.log(tokenizer);
