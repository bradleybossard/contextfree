var expect = require('chai').expect;
var tokenizer = require('./tokenizer');
var cfdgsExamples = require('../cfdgs-pretty.json');

describe('tokenizer', function() {
  it('should tokenize circle grammar', function() {
    var circle = cfdgsExamples['circle'];

    var t = new tokenizer.tokenizer();
    var actual = t.tokenize(circle);

    var expected = [ 'startshape', 'c', 'rule', 'c', '{', 'CIRCLE', '{', 's',
                 '3', '}', 'c', '{', 's', '.5', 'b', '.5', 'r', '10', 'x', '1',
                 '}', '}', 'rule', 'c', '{', 'c', '{', 's', '.5', '}', 'c', '{',
                 's', '.5', 'flip', '100', '}', '}' ]; 

    expect(actual).to.have.members(expected); 
  });
});
