var expect = require('chai').expect;
var cfdg = require('./index');

describe('cfdg', function() {
  it('compile', function() {
    expect(cfdg.compile()).to.be.true;
  });


  it('render', function() {
    expect(cfdg.render()).to.be.true;
  });
});
