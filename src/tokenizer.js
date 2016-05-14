// TODO: String comments
// TODO: Handle ordered arguments (i.e., square brakets)
// TODO: Handle the | operator
var _gStopChars = [" ", "{", "}", "\n", "\r", "\t"];

function tokenizeNext(pos) {
  var stops = [];
  _gStopChars.forEach(function(i) {
    var foundPos = input.indexOf( i, pos );
    if( foundPos !== -1 ){
      stops.push( foundPos + 1 )
    }		  
  });

  if (stops.length === 0) {
    return;
  }

  var i = stops.indexOf(Math.min.apply(Math, stops));

  var stopPos = stops[i];
  
  var token = input.substr(pos, stopPos-pos);
  // Strip whitespace
  token = token.replace(/[ \n\r\t]/, "" );
  
  return { token: token, lastPos: stopPos };
}

function tokenize(grammar) {
  input = grammar;
  // To make it easier to parse, we pad the brackets with spaces.
  input = input.replace( /([{}])/g, " $1");	
  
  var tokens = [];
  
  var head = { lastPos: 0 };

  do {
    head = tokenizeNext( head.lastPos );
    if( head && head.token ) {
      tokens.push( head.token );
    }
  } while (head);
  
  return tokens;
}

module.exports = {
  tokenize: tokenize
};
