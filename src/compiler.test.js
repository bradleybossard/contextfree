var expect = require('chai').expect;
var compiler = require('./compiler');
var fs = require('fs');

var cfdgsExamples = require('../grammars/cfdgs-pretty-reproducible.json');

describe('compiler', function() {
  it('should tokenize circle grammar', function() {
    var compiled = JSON.parse(fs.readFileSync('./src/testdata/compiled.json', 'utf8'));
    var c = new compiler.compiler();
    for (var i in cfdgsExamples) {
      var grammar = cfdgsExamples[i];
      var actual = c.compile(grammar);
      var expected = compiled[i];
      expect(actual).to.deep.equal(expected); 
    }
  });
});
