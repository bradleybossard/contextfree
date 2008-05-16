
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

	return "rgba(" + r + ", " + g + ", " + b + ", " + a + ");"

}


// TODO: String comments
// TODO: Handle ordered arguments (i.e., square brakets)
function Tokenizer( ){
	this._input = null;
	
	this._gStopChars = [" ", "{", "}", "\n", "\r", "\t"];
	
	this._tokenizeNext = function( pos ){
		var stops = [];
		
		for each( var stopChar in this._gStopChars ){
			var foundPos = this._input.indexOf( stopChar, pos );
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
	
	this._load = function( inputField ) {
		var el = document.getElementById( inputField );
		this._input = el.innerHTML;	
	}
	
	this.tokenize = function( inputField ) {
		this._load( inputField );
		return this._tokenize();		
	}	
}


// TODO: Handle ordered arguments
// TODO: Handle the shape*[] syntax
function Compiler() {
	this._keywords = ["startshape", "rule", "background"]
	this._compiled = {};
	this._state = null;	
	var compiler = this;
	
	this._generalState = function(){

		this.eat = function( token ){
			if( compiler._keywords.indexOf(token) != -1 ) {
				compiler._state = new compiler[ "_" + token + "State" ]();
			}
			else
			{
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
		for( var name in this._realState ){
			this[name] = this._realState[name];
		}
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
				for( var name in this._state ){
					this[name] = this._state[name];
				}
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

function getCanvas(){
	var canvas = document.getElementById("canvas");
	return canvas.getContext("2d");
}


function colorToRgba( color ){
  return hsl2rgb( color.h, color.s, color.b, color.a );
}


function adjustColor( color, adjustments ) {
	// See http://www.contextfreeart.org/mediawiki/index.php/Shape_adjustments
		
	var newColor = { h: color.h, s: color.s, b: color.b, a: color.a };
	
	// Add num to the drawing hue value, modulo 360 
	newColor.h += adjustments.h || adjustments.hue || 0;
	newColor.h %= 360;
	
	var adj = {};
	adj.s = adjustments.sat || adjustments.saturation;
	adj.b = adjustments.b || adjustments.brightness;		
	adj.a = adjustments.a || adjustments.alpha;
	if( typeof(adj.s) == "undefined" ){ adj.s = 0; }
	if( typeof(adj.b) == "undefined" ){ adj.b = 0; }
	if( typeof(adj.a) == "undefined" ){ adj.a = 0; }	
			
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


// Inner product of two verctors
function innerProduct( v1, v2 ) {
	var sum = 0;
	for( i = 0; i <= v1.length-1; i++ ) {
		sum += v1[i] * v2[i];
	}
	return sum;
}

// Composes two transformations (i.e., by multiplying them).
function compose( transOne, transTwo ){
	var a = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
	
	// Transpose the second transformation.
	transTwoT = [0,0,0];
	for( var i=0; i<=2; i++){
		transTwoT[i] = [transTwo[0][i], transTwo[1][i], transTwo[2][i]];
	}
	
	for( var i=0; i<=2; i++) {
		for( var j=0; j<=2; j++) {
			a[i][j] = innerProduct( transOne[i], transTwoT[j] );
		}		
	}
	return a;
}


Renderer = {
	canvas: null,
	ctx: null,
	width: null,
	height: null,
	
	compiled: null,
	
	render: function( compiled, canvasId ) {
		Renderer.compiled = compiled;
		
		Renderer.canvas = document.getElementById( canvasId );
		Renderer.ctx = Renderer.canvas.getContext("2d");
		Renderer.width = Renderer.canvas.width;
		Renderer.height = Renderer.canvas.height;		
		
		Renderer.drawBackground();	
		Renderer.draw();
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
	
	drawRule: function( ruleName, transform, color ){
	  //console.log( ruleName, transform );
		// When things get too small, we can stop rendering.
		if( transform[0][0] * 300 <= 1 && transform[1][1] * 300 <= 1 ){
			return;
		}
		
		// Choose which rule to go with...
		var choices = Renderer.compiled[ruleName];
		
		var sum = 0;
		for each( var choice in choices ){
			sum += choice.weight;
		}
		
		var r = Math.random() * sum;
		
		sum = 0;
		for each( var choice in choices ){
			sum += choice.weight;
			if( r <= sum ){
				var shape = choice;
				break;
			}
		}
		
		Renderer.drawShape( shape, transform, color );
	},
	
	drawShape: function( shape, transform, color ){
	  //console.log( "drawShape: ", shape, color)
		for each( item in shape.draw ){
			switch( item.shape ){
				case "CIRCLE":
					var localTransform = Renderer.adjustTransform( item, transform );
					Renderer.setTransform( localTransform );
					
					var newColor = adjustColor( color, item );
					
					Renderer.ctx.beginPath();
					Renderer.ctx.fillStyle = colorToRgba( newColor );
					Renderer.ctx.arc( 0, 0, .5, 0, 2*Math.PI, true )
					Renderer.ctx.fill();
					break;
					
				case "SQUARE":
					var localTransform = Renderer.adjustTransform( item, transform );
					Renderer.setTransform( localTransform );
					
					var newColor = adjustColor( color, item );
										
					Renderer.ctx.beginPath();
					Renderer.ctx.fillStyle = colorToRgba( newColor );
					Renderer.ctx.fillRect(-.5, -.5, 1, 1);
					break;
					
				default:

				  var newColor = adjustColor( color, item );
					var localTransform = Renderer.adjustTransform( item, transform );
				  
				  var threadedDraw = function(sh, lt, co){
				    this.start = function(){
				      Renderer.drawRule( sh, lt, co );
				    }
				  }
				  
				  var tD = new threadedDraw( item.shape, localTransform, newColor );
				  //tD.start();
					setTimeout( tD.start, 1 );
					
					break;
			}			
		}
	},
	
	
	setTransform: function( trans ){
		// Set the transform to the identity.
		Renderer.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		
		// Globally center and scale the transform (often the pictures are too small)
		Renderer.ctx.translate( Renderer.width/2, Renderer.height/2 );
		Renderer.ctx.scale( 300, 300 );
		
		// Perform the actual transformation.
		Renderer.ctx.transform( trans[0][0], trans[1][0], trans[0][1], trans[1][1], trans[0][2], trans[1][2] );		
	},
	

	adjustTransform: function( adjs, transform, fix ){
		// Tranalsation
		var x = typeof(adjs.x) != "undefined" ? adjs.x : 0;
		var y = typeof(adjs.y) != "undefined" ? -adjs.y : 0;
		
		if( x != 0 || y != 0 ){
			var translate = toAffineTransformation(1, 0, 0, 1, x, y);
			transform = compose( transform, translate );
		}

		// Rotation
		var r = adjs.r || adjs.rotate || "undefined";
		if( r != "undefined"){
			var cosTheta = Math.cos( -2*Math.PI * r/360 );
			var sinTheta = Math.sin( -2*Math.PI * r/360 );
			var rotate = toAffineTransformation( cosTheta, -sinTheta, sinTheta, cosTheta, 0, 0 );
			transform = compose( transform, rotate );
		}
				
		// Scaling
		var s = adjs.s || adjs.size || "undefined";
		if( s == "undefined" ){ s = 1; }
		if( typeof(s) == "number" ){ s = [s,s]; }
		
		if( s != 1 ){
			var scale = toAffineTransformation(s[0], 0, 0, s[1], 0, 0 );
			transform = compose( transform, scale );
		}						
				
		// Flip around a line through the origin;
		var f = adjs.f || adjs.flip;
		if( f ){
			vX = Math.sin( 2*Math.PI * f/360 );
			vY = Math.cos( 2*Math.PI * f/360 );
			norm = 1/(vX*vX + vY*vY);
			var flip = toAffineTransformation((vX*vX-vY*vY)/norm, 2*vX*vY/norm, 2*vX*vY/norm, (vY*vY-vX*vX)/norm, 0, 0);
			transform = compose( transform, flip );
		}
		
		return transform;
		
	}	
	
}