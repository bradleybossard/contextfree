/*
var expect = require('chai').expect;
var cfdg = require('./index');
var cfdgsExamples = require('../cfdgs-pretty.json');

describe('cfdg', function() {
  it('compile', function() {
    var circle = cfdgsExamples['circle'];
    var actual = cfdg.compile(circle);

    var expected = [ 'startshape', 'c', 'rule', 'c', '{', 'CIRCLE', '{', 's',
                 '3', '}', 'c', '{', 's', '.5', 'b', '.5', 'r', '10', 'x', '1',
                 '}', '}', 'rule', 'c', '{', 'c', '{', 's', '.5', '}', 'c', '{',
                 's', '.5', 'flip', '100', '}', '}' ];

    expect(actual).to.have.members(expected);
  });

  it('render', function() {
    expect(cfdg.render()).to.be.true;
  });
});
*/
