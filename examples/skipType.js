const Lexer = require('..');
const lexer = new Lexer('foo/*');

lexer.capture('slash', /^\//);
lexer.capture('text', /^\w+/);
lexer.capture('star', /^\*/);

lexer.skipType(['slash', 'text']);
console.log(lexer);
