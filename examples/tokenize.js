/**
 * Example of using the .tokenize method
 */

const Tokenizer = require('..');
const tokenizer = new Tokenizer()
  .capture('space', /^ +/)
  .capture('equal', /^=/)
  .capture('text', /^\w+/)
  .capture('doublequote', /^"/)
  .capture('singlequote', /^'/)
  .capture('semicolon', /^;/)

const tokens = tokenizer.tokenize('var foo = "bar";');
console.log(tokens);
