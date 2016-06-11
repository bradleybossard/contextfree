var utils = require('./utils')

var compiled = null;
var ctx = null;
var queue = [];
var width = 0;
var height = 0;
var maxStackDepth = 10000;
var isDebug = false;
var renderStartTime = 0;
var maxThreads = 30;
var maxObjects = 50000;

function drawBackground(background) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (compiled.background == undefined) {
    return;
  }
  var backgroundColor = {h:0, s:0, b:1, a:1};
  var c = utils.adjustColor( backgroundColor, background);
  ctx.fillStyle = utils.colorToRgba( c );
  ctx.fillRect( 0, 0, width, height);
}

function setTransform(trans) {
  // Globally center and scale the transform (often the pictures are too small)
  ctx.setTransform( _globalScale, 0, 0, _globalScale, width/2, height/2 );
  
  // Perform the actual transformation.
  ctx.transform(trans[0][0], trans[1][0], trans[0][1], trans[1][1], trans[0][2], trans[1][2]);
}

function adjustTransform(adjs, transform) {
  // Translation
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

function drawCircle(transform, color) {
  setTransform(transform);
  ctx.beginPath();
  ctx.fillStyle = utils.colorToRgba(color);
  ctx.arc( 0, 0, .5, 0, 2*Math.PI, true);
  ctx.fill();
  ctx.closePath();					  
  numObjects++;
}

function drawSquare(transform, color) {
  setTransform(transform);
  ctx.beginPath();
  ctx.fillStyle = utils.colorToRgba(color);
  ctx.fillRect(-.5, -.5, 1, 1);
  ctx.closePath();					  
  numObjects++;
}

function drawTriangle(transform, color) {
  setTransform(transform);
  ctx.beginPath();
  var scale = 0.57735; // Scales the side of the triagle down to unit length.
  ctx.moveTo( 0, -scale );
  for( var i=1; i<=3; i++ ){
    var angle = i*2*Math.PI/3;
    ctx.lineTo(scale*Math.sin(angle), -scale*Math.cos(angle));
  }
  ctx.fillStyle = utils.colorToRgba(color);
  ctx.fill();
  ctx.closePath();            
  numObjects++;
}

function drawRule(ruleName, stackDepth, transform, color, priority) {
  // When things get too small, we can stop rendering.
  // Too small, in this case, means less than half a pixel.
  if( (Math.abs(transform[0][1]) * _globalScale < .5 &&
      Math.abs(transform[1][1]) * _globalScale < .5 ) ||
      stackDepth > maxStackDepth) {
    return;
  }

  if (numObjects > maxObjects) {
    return;
  }

  // Choose which rule to go with...
  var choices = compiled[ruleName];
  
  var sum = 0;
  for(var i=0; i<choices.length; i++) {
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
  
  drawShape(shape, stackDepth, transform, color, priority);
}

function drawShape(shape, stackDepth, transform, color, priority) {
  for( i=0; i<shape.draw.length; i++){
    var item = shape.draw[i];
    var localTransform = adjustTransform( item, transform );
    var localColor = utils.adjustColor( color, item );
    
    switch( item.shape ) {
      case "CIRCLE":					
        drawCircle(localTransform, localColor);
        break;
        
      case "SQUARE":
        drawSquare(localTransform, localColor);
        break;
      
      case "TRIANGLE":
        drawTriangle(localTransform, localColor);
        break;
      default:
        var that = this;
        var threadedDraw = function(shape, transform, color) {
          var incStackDepth = stackDepth + 1;
          this.start = function(that) {
            drawRule(shape, incStackDepth, transform, color );
          }
        }
        
        var tD = new threadedDraw( item.shape, localTransform, localColor );
        if( priority == 1 ) {
          queue.unshift(tD);
        } else {
          queue.push(tD);
        }
        break;
    }	    
  }
}

function draw() {
  var ruleName = compiled.startshape;
  var foregroundColor = {h:0, s:0, b:0, a:1};
  drawRule(ruleName, 0, utils.IdentityTransformation(), foregroundColor);
}

function tick(stackDepth) {
  if(queue.length > 0) {
    var start = new Date();
    var concurrent = Math.min( queue.length - 1, maxThreads );
    
    for( var i = 0; i <= concurrent; i++ ) {
      queue.shift().start();
    }
    var end = new Date();

    // TODO(bradleybossard) : This handles animating the canvas, but can cause issues if
    // the user tries to render another image before the previous one completes, therefore
    // I removed the animation for now.
    //setTimeout( Renderer.tick, 2*(end-start) );
    if (stackDepth > maxStackDepth) {
      return;
    }

    var runTime = end - renderStartTime;


    //setTimeout(tick, 0, maxThreads, stackDepth);
    tick(stackDepth);
  }
}

function render(passedCompiled, canvas, seed, passedMaxObjects) {
  // If a seed is proved, use it, other generate a random seed.
  Math.seed = (seed !== undefined) ? seed : Math.floor(Math.random() * 10000);
  maxObjects = (passedMaxObjects !== undefined) ? passedMaxObjects : maxObjects; 
  numObjects = 0;
  ctx = canvas.getContext("2d");
  compiled = passedCompiled;
  
  width = canvas.width;
  height = canvas.height;
 
  // TODO(bradleybossard): Understand what this var does.
  _globalScale = width / 4;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (compiled.background !== undefined) {
    drawBackground(compiled.background);
  }

  renderStartTime = new Date();

  draw(compiled);
  tick(); // maxThreads, make this configurable

  var end = new Date();
  var runTime = end - renderStartTime;
  if (isDebug) {
    console.log('Render time: ' + runTime + ' ms');
  }
}

module.exports = {
  render: render
}
