var tokenizer = require('./tokenizer');
var compiler = require('./compiler');
var renderer = require('./renderer');
var fs = require('fs');
var Canvas = require('canvas');
var async = require('async');
//var cfdgsExamples = require('../cfdgs-pretty.json');
var cfdgsExamples = require('../grammars/cfdgs-pretty-non-broken.json');

var dirname = "./src/testdata/expected";
var tokenizedFilepath = "./src/testdata/tokenized.json";
var compiledFilepath = "./src/testdata/compiled.json";

var height = 600;
var width = 600;
var randomNumber = 300;
var maxObjects = 100;

var keys = Object.keys(cfdgsExamples);
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

  var render = renderer.render(compiledTree, canvas, randomNumber, maxObjects);

  if (!fs.existsSync(dirname)){
    fs.mkdirSync(dirname);
  }

  canvas.toBuffer(function(err, buf) {
    fs.writeFile(filename, buf, function() {
      console.log(filename + ' done');
      callback();
    });
  });
});

var tokenizedString = JSON.stringify(tokenized);
var compiledString = JSON.stringify(compiled);

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
