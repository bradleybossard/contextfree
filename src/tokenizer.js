// TODO: String comments
// TODO: Handle ordered arguments (i.e., square brakets)
// TODO: Handle the | operator
//
module.exports = {
  tokenizer : function() {
	this._input = null;
	
	this._gStopChars = [" ", "{", "}", "\n", "\r", "\t"];
	
	this._tokenizeNext = function( pos ){
		var stops = [];
		var self = this;
		
		this._gStopChars.forEach(function(i) {
			var foundPos = self._input.indexOf( i, pos );
			if( foundPos !== -1 ){
				stops.push( foundPos + 1 )
			}		  
		});
	
    if (stops.length === 0) {
      return;
    }

    var i = stops.indexOf(Math.min.apply(Math, stops));

		var stopChar = this._gStopChars[i];
		var stopPos = stops[i];
		
		var token = this._input.substr(pos, stopPos-pos);
    // Strip whitespace
		token = token.replace(/[ \n\r\t]/, "" );
		
		return { token: token, lastPos: stopPos };
	}
	
	this._tokenize = function(){
		// To make it easier to parse, we pad the brackets with spaces.
		this._input = this._input.replace( /([{}])/g, " $1");	
		
		var tokens = [];
		
		var head = { lastPos: 0 };

		do {
      head = this._tokenizeNext( head.lastPos );
			if( head && head.token ) {
				tokens.push( head.token );
			}
		} while (head);
		
		return tokens;
	}
	
	this.tokenize = function(cfdg) {
    this._input = cfdg;
		return this._tokenize();		
	}	
}

};
