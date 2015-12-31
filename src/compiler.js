// TODO: Handle ordered arguments
// TODO: Handle the shape*[] syntax
// TODO: Handle the | argument
// TODO: Handle comments

module.exports = {
  //Compiler: Compiler

//function Compiler() {
//var Compiler = function() {
  compiler : function() {
	this._keywords = ["startshape", "rule", "background"];
	this._compiled = {};
	this._state = null;	
	var compiler = this;
	
	this._generalState = function(){

		this.eat = function( token ){
			if( compiler._keywords.indexOf(token) != -1 ) {
				compiler._state = new compiler[ "_" + token + "State" ]();
			} else {
				console.log( token, " is not a general state token!" );
			}
		}
	}
	
	this._startshapeState = function() {
		this.eat = function( token ){
			compiler._compiled[ "startshape" ] = token;
			compiler._state = new compiler._generalState();
		}
	}

	this._backgroundState = function(){
		this._realState = new compiler._abstractArgumentState();
				
		this._realState.onDone = function( obj ){
			compiler._compiled[ "background" ] = obj;
			compiler._state = new compiler._generalState();			
		}
		
		// Inheritance from the the _abstractArgumentState.
		Object.extend( this, this._realState);
	}

	this._abstractArgumentState = function() {
		this._curKey = null;
		this._curValues = [];
		this._obj = {};
		
		this._flushKey = function() {
			if( this._curKey ){
				// If there is only one value for the key, we don't need to wrap
				// it in an array.
				if( this._curValues.length == 1 ){
					this._obj[ this._curKey ] = this._curValues[0];
				} else {
					this._obj[ this._curKey ] = this._curValues;
				}
			}
		}
		
		this.eat = function( token ) {			
			switch( token ){
				case "}":
					this._flushKey();
					this.onDone( this._obj );
				case "{":
					return;
			}
			
			// If it's a keyword name...
			if( token.match(/[a-z_]+/i) ) {
				this._flushKey();
				this._curKey = token;
				this._curValues = [];
			}
			// Otherwise it's a value (and hence a number)
			else {
				this._curValue = this._curValues.push( parseFloat(token) );
			}
		}
		
		// Override me!
		this.onDone = function( obj ){ }
	}


	this._ruleState = function(){
		// The first token is the name of the rule. After that comes
		// a "{" or the rule's weight.	
		this.eat = function( token ){
			var ruleName = token;
			
			// Create a blank rule if it doesn't aleady exist
			if( !compiler._compiled[ruleName] ){
				compiler._compiled[ruleName] = [];
			}
			compiler._state = new compiler._ruleWeightState( ruleName );			
		}
	}

	this._ruleWeightState = function( ruleName ){
		this._weight = 1;
		
		// You can either get the default weight (1) by not putting a weight after
		// a rule name, or you can define it after the name. For example:
		// rule tree { /* stuff */ }
		// rule tree .5 { /* stuff */ }		
		this.eat = function( token ) {
			if( token != "{" ){
				this._weight = parseFloat( token );
			} else {
				compiler._compiled[ruleName].push({ weight: this._weight, draw: [] })
				compiler._state = new compiler._ruleDrawState( ruleName );
			}
		}
	}
	
	// Here we actually get the shapes to be drawn. A shape consists of a name
	// and then an argument set.	
	this._ruleDrawState = function( ruleName ){			
			
		this.eat = function( token ){
			if( token == "}" ){
				compiler._state = new compiler._generalState();
				return;
			}
			
			var shapeName = token;
			
			compiler._state = new (function(){
				this._state = new compiler._abstractArgumentState();
				
				this._state.onDone = function( arguments ) {					
					var shape = { shape: shapeName };
					for( var key in arguments ){
						shape[key] = arguments[key];
					}
					
					// We are always adding to the lastest rule we've created.
					var last = compiler._compiled[ruleName].length - 1;
					compiler._compiled[ruleName][last].draw.push( shape )
					
					compiler._state = new compiler._ruleDrawState( ruleName );
				}
				
				// Inheritance from the abstract state.
				Object.extend( this, this._state);
			})()			
		}
	}
	
	this.compile = function( tokens ) {
		compiler._state = new compiler._generalState();
		tokens.reverse();
		while( tokens.length > 0 ){
			this._state.eat( tokens.pop() );
		}
		return compiler._compiled;
	};
}

};
