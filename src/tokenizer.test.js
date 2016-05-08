var expect = require('chai').expect;
var fs = require('fs');
var tokenizer = require('./tokenizer');
var cfdgsExamples = require('../cfdgs-pretty-reproducible.json');

describe('tokenizer', function() {
  it('should tokenize circle grammar', function() {
    var tokenized = JSON.parse(fs.readFileSync('./src/testdata/tokenized.json', 'utf8'));
    for (var i in cfdgsExamples) {
      var grammar = cfdgsExamples[i];
      var t = new tokenizer.tokenizer();
      var actual = t.tokenize(grammar);
      var expected = tokenized[i];
      expect(actual).to.have.members(expected); 
    }
  });
});
