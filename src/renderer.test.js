var expect = require('chai').expect;
var fs = require('fs');
var renderer = require('./renderer');
var Canvas = require('canvas');

describe('renderer', function() {
  it('should render', function() {
    var height = 1200;
    var width = 1000;
    var Image = Canvas.Image;
    var canvas = new Canvas(width, height);
    var ctx = canvas.getContext('2d');

    var compiled = JSON.parse(fs.readFileSync('./src/testdata/compiled.json', 'utf8'));

    for (var i in compiled) {
      var c = compiled[i];
      var actual = renderer.render(c, canvas, 0.24);
      fs.writeFile('output/' + i + '.png', canvas.toBuffer());
    }
  });
});
