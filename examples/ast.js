/**
 * Example of creating an AST
 */

const ast = { type: 'root', nodes: [] };
const stack = [ast];

const Tokenizer = require('..');
const tokenizer = new Tokenizer()
  .capture('text', /^\w+/)
  .capture('brace.open', /^\{/, tok => {
    // create a node to hold the contents of our brace pattern
    const brace = { type: 'brace', nodes: [tok] };

    // push the "brace" node onto the nodes array
    // of the last node on the stack
    stack[stack.length - 1].nodes.push(brace);

    // next, we also need to push the brace itself onto the stack
    // so that nodes can be pushed onto brace.nodes until
    // we get to the closing (right) brace
    stack.push(brace);

    // return the token to push it onto `tokenizer.tokens`
    return tok;
  })
  .capture('brace.close', /^\}/, tok => {
    // get the parent "brace" node by popping it from the stack
    const brace = stack.pop();

    // push the closing brace onto brace.nodes
    brace.nodes.push(tok);

    // return the token to push it onto `tokenizer.tokens`
    return tok;
  })
  .capture('comma', /^,/)
  .capture('slash', /^\//)
  .capture('star', /^\*/)
  .capture('dot', /^\./)
  .on('token', token => {
    // push all non-brace tokens onto the nodes array of
    // the "current" node on the stack (since we already
    // handle brace nodes above, to ensure they are pushed
    // on in the correct order)
    if (token.type.slice(0, 5) !== 'brace') {
      stack[stack.length - 1].nodes.push(token);
    }
  });

tokenizer.tokenize('{foo,bar,{baz,qux}}/*.txt');
console.log(JSON.stringify(ast, null, 2));

/**
 * Results in an AST that looks something like this:
 */

// var res = {
//   type: 'root',
//   nodes: [
//     {
//       type: 'brace',
//       nodes: [
//         {
//           type: 'brace.open',
//           val: '{'
//         },
//         {
//           type: 'text',
//           val: 'foo'
//         },
//         {
//           type: 'comma',
//           val: ','
//         },
//         {
//           type: 'text',
//           val: 'bar'
//         },
//         {
//           type: 'comma',
//           val: ','
//         },
//         {
//           type: 'brace',
//           nodes: [
//             {
//               type: 'brace.open',
//               val: '{'
//             },
//             {
//               type: 'text',
//               val: 'baz'
//             },
//             {
//               type: 'comma',
//               val: ','
//             },
//             {
//               type: 'text',
//               val: 'qux'
//             },
//             {
//               type: 'brace.close',
//               val: '}'
//             }
//           ]
//         },
//         {
//           type: 'brace.close',
//           val: '}'
//         }
//       ]
//     },
//     {
//       type: 'slash',
//       val: '/'
//     },
//     {
//       type: 'star',
//       val: '*'
//     },
//     {
//       type: 'dot',

//       val: '.'
//     },
//     {
//       type: 'text',
//       val: 'txt'
//     }
//   ]
// };
