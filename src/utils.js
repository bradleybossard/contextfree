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
