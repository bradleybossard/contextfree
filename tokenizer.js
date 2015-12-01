// TODO: String comments
// TODO: Handle ordered arguments (i.e., square brakets)
// TODO: Handle the | operator
function Tokenizer() {
	this._input = null;
	
	this._gStopChars = [" ", "{", "}", "\n", "\r", "\t"];
	
	this._tokenizeNext = function( pos ){
		var stops = [];
		var self = this;
		
		for( var i=0; i<this._gStopChars.length; i++ ) {
		  var stopChar = this._gStopChars[i];
			var foundPos = self._input.indexOf( stopChar, pos );
			if( foundPos != -1 ){
				stops.push( foundPos + 1 )
			}		  
		}
		
		var m = min(stops);
		var stopChar = this._gStopChars[ m.index ];
		var stopPos = m.value;
		
		if( typeof(m.value) == "undefined" ){ return null; }
		
		var token = this._input.substr(pos, stopPos-pos);
		
		// Remove whitespace characters as they can't be
		// tokens. Brackets can be tokens, so those don't
		// get removed.
		token = token.replace( /[ \n\r\t]/, "" );
		
		return { token: token, lastPos: stopPos }
	}
	
	this._tokenize = function(){
		// To make it easier to parse, we pad the brackets with spaces.
		this._input = this._input.replace( /([{}])/g, " $1");	
		
		var tokens = [];
		
		var head = {lastPos: 0}
		while( 1==1 ){
			head = this._tokenizeNext( head.lastPos );
			
			if( head == null ){ break; }
			
			if( head.token ){
				tokens.push( head.token );
			}
		}
		
		return tokens;
	}
	
	this.tokenize = function(cfdg) {
    this._input = cfdg;
		return this._tokenize();		
	}	
}
