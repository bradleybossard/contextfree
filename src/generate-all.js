var tokenizer = require('./tokenizer');
var compiler = require('./compiler');
var renderer = require('./renderer');
var fs = require('fs');
var Canvas = require('canvas');
var async = require('async');
//var cfdgsExamples = require('../cfdgs-pretty.json');
var cfdgsExamples = require('../cfdgs-pretty-non-broken.json');
var keys = Object.keys(cfdgsExamples);

for (var i = 0; i < keys.length; i++) {
  //if (i == 0 || i == 2) continue;
  if (i < 7) continue;
  var key = keys[i];
  delete cfdgsExamples[key];
}
var keys = Object.keys(cfdgsExamples);

var height = 600;
var width = 600;
var Image = Canvas.Image;

var tokenized = {};
var compiled = {};
var c = new compiler.compiler();
var r = new renderer.renderer();

async.eachSeries(keys, function(key, callback) {
  //var canvas = null;
  var canvas = new Canvas(width, height);
  var grammar = cfdgsExamples[key];
  var tokens = tokenizer.tokenize(grammar);
  tokenized[i] = tokens.slice(0);

  var compiledTree = c.compile(tokens);
  compiled[i] = compiledTree; 

  var filename = 'output/' + key + '.png';
  console.log(filename + ' started');
  //var render = r.render(compiledTree, canvas, 0.24);
  var render = r.render(compiledTree, canvas);

  canvas.toBuffer(function(err, buf) {
    console.log(buf);
    fs.writeFile(filename, buf, function() {
      console.log(filename + ' done');
      gc();
      callback();
    });
  });
});

return;

/*
function writeToCanvas(canvas, filename) {
  console.log(canvas);
  canvas.toBuffer(function(err, buf) {
    console.log(buf);
    fs.writeFile(filename, buf, function() {
      //console.log('');
      gc();
    });
  });
}

for (var i in cfdgsExamples) {
  console.log(i);
  //var canvas = new Canvas(width, height);
  canvases[i] = new Canvas(width, height);
  //canvas = new Canvas(width, height);
  //var ctx = canvas.getContext('2d');
  var grammar = cfdgsExamples[i];
  var tokens = tokenizer.tokenize(grammar);
  tokenized[i] = tokens.slice(0);
  var compiledTree = c.compile(tokens);
  compiled[i] = compiledTree; 
  console.log(compiledTree);
  //var render = r.render(compiledTree, canvas, 0.24);
  var render = r.render(compiledTree, canvas);
  gc();
  var filename = 'output/' + i + '.png';
  writeToCanvas(canvases[i], filename); 
}
*/

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
