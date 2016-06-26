var compiler = require('./compiler.js');
var renderer = require('./renderer.js');

function compile(grammar) {
  var c = new compiler.compiler();
  return(c.compile(grammar));
}

function render(compiled, canvas, canvasSize) {
  //var r = new renderer.renderer();
  // TODO(bradleybossard): Do I need canvas size?
  renderer.render(compiled, canvas, canvasSize);
}

module.exports = {
  compile: compile,
  render: render,
};
