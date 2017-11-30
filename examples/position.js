const Lexer = require('..');
const lexer = new Lexer('foo/*');
const position = require('snapdragon-position');

lexer.use(position());

lexer.capture('slash', /^\//);
lexer.capture('text', /^\w+/);
lexer.capture('star', /^\*/);

console.log(lexer.advance());
console.log(lexer.advance());
console.log(lexer.advance());

