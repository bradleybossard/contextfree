var expect = require('chai').expect;
var tokenizer = require('./tokenizer');
var compiler = require('./compiler');
var cfdgsExamples = require('../cfdgs-pretty.json');

describe('compiler', function() {
  it('should compile circle grammar', function() {
    var grammar = cfdgsExamples['circle'];
    var t = new tokenizer.tokenizer();
    var c = new compiler.compiler();
    var tokens = t.tokenize(grammar);
console.log(c);
    //var compiled = c.compile(tokens);
    //console.log(compiled);
/*
    var expected = [
      'startshape', 'c', 'rule', 'c', '{', 'CIRCLE', '{', 's', '3', '}', 'c',
      '{', 's', '.5', 'b', '.5', 'r', '10', 'x', '1', '}', '}', 'rule', 'c',
      '{', 'c', '{', 's', '.5', '}', 'c', '{', 's', '.5', 'flip', '100', '}',
      '}' ]; 

    expect(actual).to.have.members(expected); 
*/
  });
});
