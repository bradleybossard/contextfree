var tokenizer = require('./tokenizer.js');
var compiler = require('./compiler.js');

function compile(cfdg) {
  var t = new tokenizer.tokenizer();
  //var c = new compiler.compiler();
  return t.tokenize(cfdg);
  //return true;
}

function render(compiled) {
  return true;
}

module.exports = {
  compile: compile,
  render: render,
};
