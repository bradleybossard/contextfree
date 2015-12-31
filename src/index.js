var compiler = require('./compiler.js');

function compile(cfdg) {
  var c = new compiler.compiler();
  return true;
}

function render(compiled) {
  return true;
}

module.exports = {
  compile: compile,
  render: render,
};
