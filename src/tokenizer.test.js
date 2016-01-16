var expect = require('chai').expect;
var fs = require('fs');
var tokenizer = require('./tokenizer');
var cfdgsExamples = require('../cfdgs-pretty.json');

describe('tokenizer', function() {
  /*
   * This is not a test, it just creates the testdata file used in the next test.
  it('should tokenize all', function() {
    var tokenized = {};
    for (var i in cfdgsExamples) {
      var grammar = cfdgsExamples[i];
      var t = new tokenizer.tokenizer();
      var actual = t.tokenize(grammar);
      tokenized[i] = actual;
    };
    var tokenisedString = JSON.stringify(tokenized);

    fs.writeFile("./tokenized.json", tokenisedString, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  });
  */

  it('should tokenize circle grammar', function() {
    var tokenized = JSON.parse(fs.readFileSync('./tokenized.json', 'utf8'));
    for (var i in cfdgsExamples) {
      var grammar = cfdgsExamples[i];
      var t = new tokenizer.tokenizer();
      var actual = t.tokenize(grammar);
      var expected = tokenized[i];
      expect(actual).to.have.members(expected); 
    }
  });

/*
squares and circles
Golden Ratio                                                                                                                                                          
square fractal
Aza's Fractal
circle fractal
triangle fractal
Directions
Lost Heart (Mouse)
snakes
gray dotted tree
forest
mtree
tangle
zig zag
star
colored star
underground
feather boa
modern art
BULB
i ching
charcoal flower
cigarettes
Vertical Music
Koch Curve
Orbits
Japanese Flower
Urban Connection
Brownian Motion
Brownian Motion Gray
Fall
Star System BTP-73
Mouse
Mouse Tangle
Mouse Trial
Motion Mouse
Fireworks Mouse
Art Net
Chiaroscuro
Ancient Map
*/

});
