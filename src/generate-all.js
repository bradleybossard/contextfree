var tokenizer = require('./tokenizer');
var compiler = require('./compiler');
var renderer = require('./renderer');
var fs = require('fs');
var Canvas = require('canvas');
//var cfdgsExamples = require('../cfdgs-pretty-reproducible.json');
var cfdgsExamples = require('../cfdgs-pretty-non-broken.json');

var height = 1200;
var width = 1000;
var Image = Canvas.Image;

var tokenized = {};
var compiled = {};
var c = new compiler.compiler();
var r = new renderer.renderer();
for (var i in cfdgsExamples) {
  console.log(i);
  var canvas = new Canvas(width, height);
  var ctx = canvas.getContext('2d');
  var grammar = cfdgsExamples[i];
  var tokens = tokenizer.tokenize(grammar);
  tokenized[i] = tokens.slice(0);
  //compiled[i] = c.compile(tokens);
  var compiledTree = c.compile(tokens);
  compiled[i] = compiledTree; 
  console.log(compiledTree);
  var render = r.render(compiledTree, canvas, 0.24);
  fs.writeFile('output/' + i + '.png', canvas.toBuffer());
}
/*
var tokenizedString = JSON.stringify(tokenized);
var compiledString = JSON.stringify(compiled);

var tokenizedFilepath = "./src/testdata/tokenized.json";
var compiledFilepath = "./src/testdata/compiled.json";

fs.writeFile(tokenizedFilepath, tokenizedString, function(err) {
  if(err) {
    return console.log(err);
  }
  console.log("The file " + tokenizedFilepath + " was saved!");
});

fs.writeFile(compiledFilepath, compiledString, function(err) {
  if(err) {
    return console.log(err);
  }
  console.log("The file " + compiledFilepath + " was saved!");
});
*/
