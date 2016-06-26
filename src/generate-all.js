// This script is used to generate all the golden data and images for
// the tests.

var compiler = require('./compiler');
var renderer = require('./renderer');
var fs = require('fs');
var Canvas = require('canvas');
var async = require('async');
//var cfdgsExamples = require('../cfdgs-pretty.json');
var cfdgsExamples = require('../grammars/cfdgs-pretty-non-broken.json');

var dirname = "./src/testdata/expected";
var compiledFilepath = "./src/testdata/compiled.json";

var height = 600;
var width = 600;
var randomNumber = 300;
var maxObjects = 1000;

var keys = Object.keys(cfdgsExamples);

var compiled = {};
var c = new compiler.compiler();

if (!fs.existsSync(dirname)){
  fs.mkdirSync(dirname);
}

async.eachSeries(keys, function writeImage(key, callback) {
  var canvas = new Canvas(width, height);
  var grammar = cfdgsExamples[key];

  var compiledTree = c.compile(grammar);
  compiled[key] = compiledTree; 

  var filename = dirname + '/' + key + '.png';
  console.log(filename + ' started');

  var render = renderer.render(compiledTree, canvas, randomNumber, maxObjects);

  canvas.toBuffer(function(err, buf) {
    fs.writeFile(filename, buf, function() {
      console.log(filename + ' done');
      callback();
    });
  });
}, 
function writeCompiled() {
  var compiledString = JSON.stringify(compiled);
  fs.writeFile(compiledFilepath, compiledString, function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file " + compiledFilepath + " was saved!");
  });
});
