(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.module = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// TODO: Handle ordered arguments
// TODO: Handle the shape*[] syntax
// TODO: Handle the | argument
// TODO: Handle comments

Object.forceExtend = function(dst, src) {
  for (var i in src) {
    try{ dst[i] = src[i] } catch(e) {}
  }
  return dst
}
// In case Object.extend isn't defined already, set it to Object.forceExtend.
if (!Object.extend) {
  Object.extend = Object.forceExtend
}  

module.exports = {
  compiler : function() {
	this._keywords = ["startshape", "rule", "background"];
	this._compiled = {};
	this._state = null;	
	var compiler = this;
	
	this._generalState = function() {

		this.eat = function( token ) {
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
				
				this._state.onDone = function( args ) {					
					var shape = { shape: shapeName };
					for( var key in args ){
						shape[key] = args[key];
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
    this._compiled = {};
    this._state = null;	
		compiler._state = new compiler._generalState();
		tokens.reverse();
		while( tokens.length > 0 ){
			this._state.eat( tokens.pop() );
		}
		return compiler._compiled;
	};
}

};

},{}],2:[function(require,module,exports){
var tokenizer = require('./tokenizer.js');
var compiler = require('./compiler.js');
var renderer = require('./renderer.js');

function tokenize(grammar) {
  return tokenizer.tokenize(grammar);
}

function compile(tokens) {
  var c = new compiler.compiler();
  var a =0;
  console.log("point1");
  return(c.compile(tokens));
}

function render(compiled, canvas, canvasSize) {
  var r = new renderer.renderer();
  // TODO(bradleybossard): Do I need canvas size?
  r.render(compiled, canvas, canvasSize);
}

module.exports = {
  tokenize: tokenize,
  compile: compile,
  render: render,
};

},{"./compiler.js":1,"./renderer.js":3,"./tokenizer.js":4}],3:[function(require,module,exports){
var utils = require('./utils')

function drawBackground(background, ctx) {
  var backgroundColor = {h:0, s:0, b:1, a:1};
  var c = utils.adjustColor( backgroundColor, background);
  ctx.fillStyle = utils.colorToRgba( c );
  ctx.fillRect( 0, 0, width, height);
}

module.exports = {
  renderer: function() {
    ctx = null;
    width = null;
    height = null;
    
    compiled =  null;
    _maxThreads = 30;
    
    queue = [];

    this.render = function( compiled, canvas, seed) {
      this.compiled = compiled;
      // If a seed is proved, use it, other generate a random seed.
      Math.seed = (seed !== undefined) ? seed : Math.floor(Math.random() * 10000);
      ctx = canvas.getContext("2d");
      
      width = canvas.width;
      height = canvas.height;
     
      // TODO(bradleybossard): Understand what this var does.
      _globalScale = 300;
      _rendering = false;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);

      if (compiled.background !== undefined) {
        drawBackground(compiled.background, ctx);
      }
      this.draw();
      this.tick();
    },
    
    this.tick = function() {
      if( queue.length > 0 ) {
        _rendering = true;
        var start = new Date();
        var concurrent = Math.min( queue.length - 1, _maxThreads );
        
        for( var i = 0; i <= concurrent; i++ ) {
          queue.shift().start();
        }
        var end = new Date();
       
        // TODO(bradleybossard) : This handles animating the canvas, but can cause issues if
        // the user tries to render another image before the previous one completes, therefore
        // I removed the animation for now.
        //setTimeout( Renderer.tick, 2*(end-start) );
        this.tick();
      }
      _rendering = false;
    },
    this.draw = function() {
      var ruleName = this.compiled.startshape;
      var foregroundColor = {h:0, s:0, b:0, a:1};
      this.drawRule( ruleName, utils.IdentityTransformation(), foregroundColor );
    },
    
    this.drawRule = function( ruleName, transform, color, priority ){
      // When things get too small, we can stop rendering.
      // Too small, in this case, means less than half a pixel.
      if( Math.abs(transform[0][1]) * _globalScale < .5 && Math.abs(transform[1][1]) * _globalScale < .5 ){
        return;
      }
      
      // Choose which rule to go with...
      var choices = this.compiled[ruleName];
      
      var sum = 0;
      for( var i=0; i<choices.length; i++) {
        sum += choices[i].weight;
      }
     
      var r = Math.seededRandom() * sum;
      sum = 0;
      
      for( var i=0; i <= choices.length-1; i++) {
        sum += choices[i].weight;
        if( r <= sum ){
          var shape = choices[i];
          break;
        }
      }
      
      this.drawShape( shape, transform, color, priority );
    },

	this._draw = function( transform, drawFunc ) {	  
    this.setTransform( transform );
    drawFunc( ctx );
    return;
	},
	
    this.drawShape = function( shape, transform, color, priority ) {
      for( i=0; i<shape.draw.length; i++){
        var item = shape.draw[i];
        var localTransform = this.adjustTransform( item, transform );
        var localColor = utils.adjustColor( color, item );
        
        switch( item.shape ) {

          case "CIRCLE":					
            this._draw( localTransform, function(ctx) {
              ctx.beginPath();
              ctx.fillStyle = utils.colorToRgba( localColor );
              ctx.arc( 0, 0, .5, 0, 2*Math.PI, true )
              ctx.fill();
              ctx.closePath();					  
            });
            break;
            
          case "SQUARE":
            this._draw( localTransform, function(ctx) {
              ctx.beginPath();
              ctx.fillStyle = utils.colorToRgba( localColor );
              ctx.fillRect(-.5, -.5, 1, 1);
              ctx.closePath();					  
            });
            break;
          
          case "TRIANGLE":
            this._draw( localTransform, function(ctx) {
              ctx.beginPath();
              var scale = 0.57735; // Scales the side of the triagle down to unit length.
              ctx.moveTo( 0, -scale );
              for( var i=1; i<=3; i++ ){
                var angle = i*2*Math.PI/3;
                ctx.lineTo(scale*Math.sin(angle), -scale*Math.cos(angle));
              }
              ctx.fillStyle = utils.colorToRgba( localColor );
              ctx.fill();
              ctx.closePath();            
            });
            break;
                      
          default:
            var that = this;
            var threadedDraw = function(shape, transform, color) {
              this.start = function() {
                that.drawRule( shape, transform, color );
              }
            }
            
            var tD = new threadedDraw( item.shape, localTransform, localColor );
            if( priority == 1 ) {
              //Renderer.queue.unshift(tD);
              queue.unshift(tD);
            } else {
              //Renderer.queue.push( tD );
              queue.push(tD);
            }
            break;
        }	    
      }
    },
    this.setTransform = function( trans ){
      // Globally center and scale the transform (often the pictures are too small)
      ctx.setTransform( _globalScale, 0, 0, _globalScale, width/2, height/2 );
      
      // Perform the actual transformation.
      ctx.transform( trans[0][0], trans[1][0], trans[0][1], trans[1][1], trans[0][2], trans[1][2] );
    },
    this.adjustTransform = function( adjs, transform ){
      // Tranalsation
      var x = utils.getKeyValue( "x", 0, adjs );
      var y = -utils.getKeyValue( "y", 0, adjs );
          
      if( x != 0 || y != 0 ){
        var translate = utils.toAffineTransformation(1, 0, 0, 1, x, y);
        transform = utils.compose( transform, translate );
      }

      // Rotation
      var r = utils.getKeyValue( ["r", "rotate"], null, adjs );
      if( r != null ){
        var radius = -2*Math.PI * r/360;
        var cosTheta = Math.cos(radius);
        var sinTheta = Math.sin(radius);
        var rotate = utils.toAffineTransformation( cosTheta, -sinTheta, sinTheta, cosTheta, 0, 0 );
        transform = utils.compose( transform, rotate );
      }
          
      // Scaling
      var s = utils.getKeyValue( ["s", "size"], 1, adjs );
      if(typeof(s) == "number") {
        s = [s,s];
      }
      
      if(s != 1) {
        var scale = utils.toAffineTransformation(s[0], 0, 0, s[1], 0, 0 );
        transform = utils.compose( transform, scale );
      }						
          
      // Flip around a line through the origin;
      var f = utils.getKeyValue( ["f", "flip"], null, adjs );
      if(f != null) {
        // Flip 0 means to flip along the X axis. Flip 90 means to flip along the Y axis.
        // That's why the flip vector (vX, vY) is Pi/2 radians further along than expected. 
        vX = Math.cos( -2*Math.PI * f/360 );
        vY = Math.sin( -2*Math.PI * f/360 );
        norm = 1/(vX*vX + vY*vY);
        var flip = utils.toAffineTransformation((vX*vX-vY*vY)/norm, 2*vX*vY/norm, 2*vX*vY/norm, (vY*vY-vX*vX)/norm, 0, 0);
        transform = utils.compose( transform, flip );
      }
      
      return transform;
    }		
  }
}

},{"./utils":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

// the initial seed
Math.seed = 6;
 
// in order to work 'Math.seed' must NOT be undefined,
// so in any case, you HAVE to provide a Math.seed
Math.seededRandom = function(max, min) {
    max = max || 1;
    min = min || 0;
 
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
 
    return min + rnd * (max - min);
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
	if (h == 360) {
    h = 0;
  }

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
	} else {
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

module.exports = {
  IdentityTransformation: IdentityTransformation,
  compose: compose,
  toAffineTransformation: toAffineTransformation,
  getKeyValue: getKeyValue,
  adjustColor: adjustColor,
  colorToRgba: colorToRgba
}

},{}]},{},[2])(2)
});