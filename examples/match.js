const position = require('snapdragon-position');
const Lexer = require('..');
const lexer = new Lexer('foo/bar');
lexer.use(position());

const pos = lexer.position();
const match = lexer.match(/^\w+/);
const tok = pos(lexer.token('text', match[0], match));
console.log(tok);
