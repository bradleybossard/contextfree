var tokenizer = require('./tokenizer.js');
var compiler = require('./compiler.js');
var renderer = require('./renderer.js');

function tokenize(grammar) {
  return tokenizer.tokenize(grammar);
}

function compile(tokens) {
  var c = new compiler.compiler();
  return(c.compile(tokens));
}

function render(compiled, canvas, canvasSize) {
  //var r = new renderer.renderer();
  // TODO(bradleybossard): Do I need canvas size?
  renderer.render(compiled, canvas, canvasSize);
}

module.exports = {
  tokenize: tokenize,
  compile: compile,
  render: render,
};
