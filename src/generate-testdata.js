var tokenizer = require('./tokenizer');
var compiler = require('./compiler');
var fs = require('fs');
var cfdgsExamples = require('../cfdgs-pretty-reproducible.json');
//var cfdgsExamples = require('../cfdgs-pretty.json');

var tokenized = {};
var compiled = {};
var c = new compiler.compiler();
for (var i in cfdgsExamples) {
  var grammar = cfdgsExamples[i];
  var tokens = tokenizer.tokenize(grammar);
  tokenized[i] = tokens.slice(0);
  compiled[i] = c.compile(tokens);
}
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


