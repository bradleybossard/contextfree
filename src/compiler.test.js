var expect = require('chai').expect;
var tokenizer = require('./tokenizer');

var compiler = require('./compiler');
var fs = require('fs');

describe('compiler', function() {
  it('should tokenize circle grammar', function() {
    var tokenized = JSON.parse(fs.readFileSync('./src/testdata/tokenized.json', 'utf8'));
    var compiled = JSON.parse(fs.readFileSync('./src/testdata/compiled.json', 'utf8'));
    var c = new compiler.compiler();
    for (var i in tokenized) {
      var t = tokenized[i];
      var actual = c.compile(t);
      var expected = compiled[i];
      expect(actual).to.deep.equal(expected); 
    }
  });
});
