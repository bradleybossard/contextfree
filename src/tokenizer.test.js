var expect = require('chai').expect;
var tokenizer = require('./tokenizer');
var cfdgsExamples = require('../cfdgs-pretty.json');

describe('tokenizer', function() {
  it('should tokenize circle grammar', function() {
    var grammar = cfdgsExamples['circle'];
    var t = new tokenizer.tokenizer();
    var actual = t.tokenize(grammar);

    var expected = [
      'startshape', 'c', 'rule', 'c', '{', 'CIRCLE', '{', 's', '3', '}', 'c',
      '{', 's', '.5', 'b', '.5', 'r', '10', 'x', '1', '}', '}', 'rule', 'c',
      '{', 'c', '{', 's', '.5', '}', 'c', '{', 's', '.5', 'flip', '100', '}',
      '}' ]; 

    expect(actual).to.have.members(expected); 
  });


  it('should tokenize snakes grammar', function() {
    var grammar = cfdgsExamples['snakes'];
    var t = new tokenizer.tokenizer();
    var actual = t.tokenize(grammar);

    var expected = [
      'startshape', 'starter', 'rule', 'starter', '{', 'snakeparty', '{', 's',
      '.5', 'x', '-1', 'y', '-.5', '}', '}', 'rule', 'snakeparty', '{', 'snake',
      '{', '}', 'snakeparty', '{', 'y', '1.0', 's', '0.95', 'r', '-15', '}',
      '}', 'rule', 'snakeeye', '{', 'CIRCLE', '{', 'b', '1', '}', 'CIRCLE', '{',
      'b', '-1', 's', '0.4', 'x', '-0.35', '}', '}', 'rule', 'snake', '{',
      'snaketail', '{', '}', 'snakeeye', '{', 's', '0.4', 'x', '-0.2', 'y',
      '0.2', '}', 'snakemouth', '{', 'x', '-0.5', 'y', '-0.2', 's', '0.3', '}',
      '}', 'rule', 'snaketail', '{', 'CIRCLE', '{', '}', 'SQUARE', '{', 'x',
      '0.32', 'y', '0.1', 's', '0.5', 'r', '-30', '}', 'SQUARE', '{', 'x',
      '0.32', 'y', '-0.1', 's', '0.5', 'r', '30', '}', 'snaketail', '{', 'x',
      '0.8', 's', '0.7', '}', '}', 'rule', 'snakemouth', '{', 'SQUARE', '{',
      'b', '1', 'r', '65', '}', '}' ];

    expect(actual).to.have.members(expected); 
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
