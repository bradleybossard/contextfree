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

    //Renderer.ctx.save();
    Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0);
    Renderer.ctx.clearRect(0, 0, Renderer.width, Renderer.height);
    //Renderer.ctx.restore();

		Renderer.drawBackground();
		Renderer.draw();
		Renderer.tick();
	},
	
	tick: function(){
	  if( Renderer.queue.length > 0 ) {
	    Renderer._rendering = true;
  	  var start = new Date();
      var concurrent = Math.min( Renderer.queue.length - 1, Renderer._maxThreads );
      
      for( var i=0; i<=concurrent; i++ ){
        Renderer.queue.shift().start();
      }
      var end = new Date();
     
      // TODO(bradleybossard) : This handles animating the canvas, but can cause issues if
      // the user tries to render another image before the previous one completes, therefore
      // I removed the animation for now.
	    //setTimeout( Renderer.tick, 2*(end-start) );
	    Renderer.tick();
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
				  
				  if( priority == 1 ) {
            Renderer.queue.unshift(tD);
          } else {
            Renderer.queue.push( tD );
          }
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
		if(typeof(s) == "number") {
      s = [s,s];
    }
		
		if(s != 1) {
			var scale = toAffineTransformation(s[0], 0, 0, s[1], 0, 0 );
			transform = compose( transform, scale );
		}						
				
		// Flip around a line through the origin;
		var f = getKeyValue( ["f", "flip"], null, adjs );
		if(f != null) {
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

