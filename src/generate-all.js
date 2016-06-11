var tokenizer = require('./tokenizer');
var compiler = require('./compiler');
var renderer = require('./renderer');
var fs = require('fs');
var Canvas = require('canvas');
var async = require('async');
//var cfdgsExamples = require('../cfdgs-pretty.json');
var cfdgsExamples = require('../grammars/cfdgs-pretty-non-broken.json');
var keys = Object.keys(cfdgsExamples);

// This code is used for removing cfdgs to test certain grammars.
if (false) {
  for (var i = 0; i < keys.length; i++) {
    //if (i == 5 || i == 5) continue;
    if (i < 10) continue;
    var key = keys[i];
    delete cfdgsExamples[key];
  }
  var keys = Object.keys(cfdgsExamples);
}

var dirname = 'output';

var height = 600;
var width = 600;
var Image = Canvas.Image;

var tokenized = {};
var compiled = {};
var c = new compiler.compiler();

async.eachSeries(keys, function(key, callback) {
  var canvas = new Canvas(width, height);
  var grammar = cfdgsExamples[key];
  var tokens = tokenizer.tokenize(grammar);
  tokenized[key] = tokens.slice(0);

  var compiledTree = c.compile(tokens);
  compiled[key] = compiledTree; 

  var filename = dirname + '/' + key + '.png';
  console.log(filename + ' started');

  var render = renderer.render(compiledTree, canvas, 300);

  if (!fs.existsSync(dirname)){
    fs.mkdirSync(dirname);
  }

  canvas.toBuffer(function(err, buf) {
    fs.writeFile(filename, buf, function() {
      console.log(filename + ' done');
      //gc();
      callback();
    });
  });
});

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


