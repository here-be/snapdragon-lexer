/**
 * Example of using the .tokenize method
 */

const Tokenizer = require('..');
const tokenizer = new Tokenizer()
  .capture('space', /^ +/)
  .capture('equal', /^=/)
  .capture('text', /^\w+/)
  .capture('quote_single', /^"/)
  .capture('quote_double', /^'/)
  .capture('semi', /^;/)

const tokens = tokenizer.lex('const foo = "bar";');
console.log(tokens);
