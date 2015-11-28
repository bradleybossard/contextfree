function min( list ){
	var min = { value: list[0], index: 0 };
	for( var i in list ) {
		if ( list[i] < min.value ){
			min.value = list[i];
			min.index = i;
		}
	}
	
	return min;
}

Object.forceExtend = function(dst, src) {
  for (var i in src) {
    try{ dst[i] = src[i] } catch(e) {}
  }
  return dst
}
// In case Object.extend isn't defined already, set it to Object.forceExtend.
if (!Object.extend){
  Object.extend = Object.forceExtend
}  

// Used within a function to get an synonym'ed arguments value, or supply a default.
// For example:
//   var hue = getKeyValue( ["h", "hue"], 0, args );
//   var x = getKeyValue( "x", 1, args );
//
function getKeyValue( possibleVariableNames, defaultValue, argList ){
  // We can either be getting a list of strings or a string. If we get a string,
  // we just convert it into a list containing that string.
  if( typeof(possibleVariableNames) == "string" ) {
    possibleVariableNames = [possibleVariableNames];
  }

  for( var i=0; i<=possibleVariableNames.length-1; i++) {
    var name = possibleVariableNames[i];
    if( typeof(argList[name]) != "undefined" ) {
      return argList[name];
    }
  }
  
  return defaultValue;
}

// indexOf
if(!Array.indexOf){
  Array.prototype.indexOf = function(obj){
    for(var i=0; i<this.length; i++){
      if(this[i]==obj){
        return i;
      }
    }
    return -1;
  }
}

// hue, saturation, brightness, alpha
// hue: [0,360) default 0
// saturation: [0,1] default 0
// brightness: [0,1] default 1
// alpha: [0,1] default 1
function hsl2rgb(h, s, l, a){	
	if (h == 360){ h = 0;}

	//
	// based on C code from http://astronomy.swin.edu.au/~pbourke/colour/hsl/
	//

	while (h < 0){ h += 360; }
	while (h > 360){ h -= 360; }
	var r, g, b;
	if (h < 120){
		r = (120 - h) / 60;
		g = h / 60;
		b = 0;
	}else if (h < 240){
		r = 0;
		g = (240 - h) / 60;
		b = (h - 120) / 60;
	}else{
		r = (h - 240) / 60;
		g = 0;
		b = (360 - h) / 60;
	}

	r = Math.min(r, 1);
	g = Math.min(g, 1);
	b = Math.min(b, 1);

	r = 2 * s * r + (1 - s);
	g = 2 * s * g + (1 - s);
	b = 2 * s * b + (1 - s);

	if (l < 0.5){
		r = l * r;
		g = l * g;
		b = l * b;
	}else{
		r = (1 - l) * r + 2 * l - 1;
		g = (1 - l) * g + 2 * l - 1;
		b = (1 - l) * b + 2 * l - 1;
	}

	r = Math.ceil(r * 255);
	g = Math.ceil(g * 255);
	b = Math.ceil(b * 255);

  // Putting a semicolon at the end of an rgba definition
  // causes it to not work.
	return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")"

}


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
/*
	this._load = function( inputField ) {
		var el = document.getElementById( inputField );
		this._input = el.value;	
	}
*/
	
	//this.tokenize = function( inputField ) {
	this.tokenize = function(cfdg) {
		//this._load( inputField );
    this._input = cfdg;
    console.log(this._input);
		return this._tokenize();		
	}	
}


// TODO: Handle ordered arguments
// TODO: Handle the shape*[] syntax
// TODO: Handle the | argument
// TODO: Handle comments
function Compiler() {
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


function colorToRgba( color ){
  return hsl2rgb( color.h, color.s, color.b, color.a );
}

function adjustColor( color, adjustments ) {
	// See http://www.contextfreeart.org/mediawiki/index.php/Shape_adjustments
	var newColor = { h: color.h, s: color.s, b: color.b, a: color.a };
	
	// Add num to the drawing hue value, modulo 360 
	newColor.h += getKeyValue( ["h", "hue"], 0, adjustments );
	newColor.h %= 360;
	
	var adj = {};
	adj.s = getKeyValue( ["sat", "saturation"], 0, adjustments )
	adj.b = getKeyValue( ["b", "brightness"], 0, adjustments )
	adj.a = getKeyValue( ["a", "alpha"], 0, adjustments )
			
	// If adj<0 then change the drawing [blah] adj% toward 0.
	// If adj>0 then change the drawing [blah] adj% toward 1. 
	for( var key in adj ) {
		if( adj[key] > 0 ){
			newColor[key] += adj[key] * (1-color[key]);
		} else {
			newColor[key] += adj[key] * color[key];
		}
	}
			
	return newColor;	
}


function IdentityTransformation(){
	// 3x3 Matrix. This is the identity affine transformation.
	return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
}

function toAffineTransformation( a, b, c, d, x, y ){
	return [ [a,b,x], [c,d,y], [0,0,1] ];
}

// Composes two transformations (i.e., by multiplying them).
function compose(m1, m2) {
  var result = IdentityTransformation();

  for (var x = 0; x < 3; x++) {
    for (var y = 0; y < 3; y++) {
      var sum = 0;

      for (var z = 0; z < 3; z++) {
        sum += m1[x][z] * m2[z][y];
      }

      result[x][y] = sum;
    }
  }
  return result;
}



Renderer = {
	canvas: null,
	ctx: null,
	width: null,
	height: null,
	
	compiled: null,
	_maxThreads: 30,
	
	queue: [],
	
	render: function( compiled, canvasId ) {
		Renderer.compiled = compiled;
		
		Renderer.canvas = document.getElementById( canvasId );
                    		
		Renderer.ctx = Renderer.canvas.getContext("2d");
		
    Renderer.width = Renderer.canvas.width;
		Renderer.height = Renderer.canvas.height;
		
		Renderer._globalScale = 300;
		Renderer._rendering = false;
		
		Renderer.drawBackground();
		Renderer.draw();
		Renderer.tick();
	},
	
	tick: function(){
	  if( Renderer.queue.length > 0 ){
	    Renderer._rendering = true;
  	  var start = new Date();
      var concurrent = Math.min( Renderer.queue.length - 1, Renderer._maxThreads );
      
      for( var i=0; i<=concurrent; i++ ){
        Renderer.queue.shift().start();
      }
      var end = new Date();
      
	    setTimeout( Renderer.tick, 2*(end-start) );
	  }
	  Renderer._rendering = false;
	},
	drawBackground: function() {
		if( Renderer.compiled.background ){
			var colorAdj = Renderer.compiled.background;
			var backgroundColor = {h:0, s:0, b:1, a:1};
			var c = adjustColor( backgroundColor, colorAdj );

			Renderer.ctx.fillStyle = colorToRgba( c );
			Renderer.ctx.fillRect( 0, 0, Renderer.width, Renderer.width );
		}
	},
	
	draw: function() {
		var ruleName = Renderer.compiled.startshape;
		var foregroundColor = {h:0, s:0, b:0, a:1};
		Renderer.drawRule( ruleName, IdentityTransformation(), foregroundColor );
	},
	
	drawRule: function( ruleName, transform, color, priority ){
		// When things get too small, we can stop rendering.
		// Too small, in this case, means less than half a pixel.
		if( Math.abs(transform[0][1])*Renderer._globalScale < .5 && Math.abs(transform[1][1])*Renderer._globalScale < .5 ){
			return;
		}
		
		// Choose which rule to go with...
		var choices = Renderer.compiled[ruleName];
		
		var sum = 0;
		for( var i=0; i<choices.length; i++) {
		  sum += choices[i].weight;
		}
		
		var r = Math.random() * sum;
		
		sum = 0;
		
		for( var i=0; i <= choices.length-1; i++) {
			sum += choices[i].weight;
			if( r <= sum ){
				var shape = choices[i];
				break;
			}
		}
		
		Renderer.drawShape( shape, transform, color, priority );
	},
	
	_draw: function( transform, drawFunc ) {	  
    Renderer.setTransform( transform );
    drawFunc( Renderer.ctx );
    return;
	},
	
	drawShape: function( shape, transform, color, priority ){
	  for( i=0; i<shape.draw.length; i++){
	    var item = shape.draw[i];

			var localTransform = Renderer.adjustTransform( item, transform );
			var localColor = adjustColor( color, item );
	    
			switch( item.shape ){
				case "CIRCLE":					
					Renderer._draw( localTransform, function(ctx) {
  					ctx.beginPath();
  					ctx.fillStyle = colorToRgba( localColor );
  					ctx.arc( 0, 0, .5, 0, 2*Math.PI, true )
  					ctx.fill();
  					ctx.closePath();					  
					});
					break;
					
				case "SQUARE":
					Renderer._draw( localTransform, function(ctx) {
  					ctx.beginPath();
  					ctx.fillStyle = colorToRgba( localColor );
  					ctx.fillRect(-.5, -.5, 1, 1);
  					ctx.closePath();					  
					});
					break;
				
				case "TRIANGLE":
          Renderer._draw( localTransform, function(ctx) {
  					ctx.beginPath();
  					var scale = 0.57735; // Scales the side of the triagle down to unit length.
  					ctx.moveTo( 0, -scale );
  					for( var i=1; i<=3; i++ ){
  					  ctx.lineTo( scale*Math.sin( i*2*Math.PI/3 ), -scale*Math.cos( i*2*Math.PI/3 ) );
  					}
  					ctx.fillStyle = colorToRgba( localColor );
  					ctx.fill();
  					ctx.closePath();            
          });
					break;
										
				default:
				  var threadedDraw = function(shape, transform, color){
				    this.start = function(){
				      Renderer.drawRule( shape, transform, color );
				    }
				  }
				  
				  var tD = new threadedDraw( item.shape, localTransform, localColor );
				  
				  if( priority == 1 ){ Renderer.queue.unshift(tD); }
				  else{ Renderer.queue.push( tD ); }
				  					
					break;
			}	    
	  }
	},
	
	setTransform: function( trans ){
		// Globally center and scale the transform (often the pictures are too small)
		Renderer.ctx.setTransform( Renderer._globalScale, 0, 0, Renderer._globalScale, Renderer.width/2, Renderer.height/2 );
		
		// Perform the actual transformation.
		Renderer.ctx.transform( trans[0][0], trans[1][0], trans[0][1], trans[1][1], trans[0][2], trans[1][2] );
	},
	

	adjustTransform: function( adjs, transform ){
		// Tranalsation
		var x = getKeyValue( "x", 0, adjs );
		var y = -getKeyValue( "y", 0, adjs );
  			
		if( x != 0 || y != 0 ){
			var translate = toAffineTransformation(1, 0, 0, 1, x, y);
			transform = compose( transform, translate );
		}

		// Rotation
		var r = getKeyValue( ["r", "rotate"], null, adjs );
		if( r != null ){
			var cosTheta = Math.cos( -2*Math.PI * r/360 );
			var sinTheta = Math.sin( -2*Math.PI * r/360 );
			var rotate = toAffineTransformation( cosTheta, -sinTheta, sinTheta, cosTheta, 0, 0 );
			transform = compose( transform, rotate );
		}
				
		// Scaling
		var s = getKeyValue( ["s", "size"], 1, adjs );
		if( typeof(s) == "number" ){ s = [s,s]; }
		
		if( s != 1 ){
			var scale = toAffineTransformation(s[0], 0, 0, s[1], 0, 0 );
			transform = compose( transform, scale );
		}						
				
		// Flip around a line through the origin;
		var f = getKeyValue( ["f", "flip"], null, adjs );
		if( f != null ){
		  // Flip 0 means to flip along the X axis. Flip 90 means to flip along the Y axis.
		  // That's why the flip vector (vX, vY) is Pi/2 radians further along than expected. 
			vX = Math.cos( -2*Math.PI * f/360 );
			vY = Math.sin( -2*Math.PI * f/360 );
			norm = 1/(vX*vX + vY*vY);
			var flip = toAffineTransformation((vX*vX-vY*vY)/norm, 2*vX*vY/norm, 2*vX*vY/norm, (vY*vY-vX*vX)/norm, 0, 0);
			transform = compose( transform, flip );
		}
		
		return transform;
	}		
}

