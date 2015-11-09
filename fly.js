goog.provide('shoot_web.Fly');
// inherits from lime.Sprite which allows creation of rectangles, images, etc.
goog.require('lime.Circle');
goog.require('lime.fill.LinearGradient');
 
shoot_web.Fly = function(gameObj, isCaught, movementBounds) {
    goog.base(this);

	// define the properties of the fly	
	this.isCaught = isCaught; // is the fly caught in the web?
	this.height = gameObj.height/50;
	this.width = gameObj.height/50;
	this.setSize(this.width, this.height);	// the size of the fly
	this.radius = (this.width/2); // because the shape is circular, radius is half of width
		
	// set the starting coordinates for the fly before animation
	this.positionX = Math.floor(Math.random() * movementBounds.right) + 1;
	this.positionY = Math.floor(Math.random() * movementBounds.bottom) + 1;
	
	// set the X and Y vectors
	this.positionVX = Math.floor(Math.random() * 2) + 1;
	this.positionVY = Math.floor(Math.random() * 3) + 1;
	
	// set the boundaries within which the fly can move
	this.movementBounds = movementBounds;		
	
	//var randomHexColour = Math.floor(Math.random()*16777215).toString(16);
	
	// define RGB of this fly
	var r = Math.floor(Math.random() * 256) + 1;
	var g = Math.floor(Math.random() * 256) + 1;
	var b = Math.floor(Math.random() * 256) + 1;
	
	// fill background with gradient
	var gradient = new lime.fill.LinearGradient()
        .setDirection(0,0,1,1) // 45' angle 
        .addColorStop(0, r, g, b ,1) // colour 1
        .addColorStop(1, r, g, b ,.5); // colour 2
	this.setFill(gradient);
}
 
goog.inherits(shoot_web.Fly,lime.Circle);

/**
 * Start new fly animation
 **/
 shoot_web.Fly.prototype.animateFly = function(gameObj, webs) {	
	// cycle through all webs and check if the current fly has collided with it	
	for(i=0; i < webs.length; i++){
		
		if(webs[i].isExpired == false){
			// the following code detects collision between this fly and the currently iterated web
			// this needs to be moved into a function
			var webInstance = webs[i];
			var distance_squared = ((this.positionX - webInstance.position_.x) * (this.positionX - webInstance.position_.x)) + ((this.positionY - webInstance.position_.y) * (this.positionY - webInstance.position_.y));
			var radii_squared = (this.radius + webInstance.radius) * (this.radius + webInstance.radius);
			var hasCollided = (distance_squared < radii_squared);
			
			// if the fly has collided with the web
			if(hasCollided){
				this.isCaught = true
			}
		}
	}
	
	this.positionX += this.positionVX;
	this.positionY += this.positionVY;
	this.setPosition(this.positionX, this.positionY);
	
	// logic to determine what to do when the fly hits a wall
	if(this.positionX >= this.movementBounds.right){
		// fly has hit right wall
		this.positionVX = (-this.positionVX);
		this.positionX = this.movementBounds.right;
	}
	else if(this.positionX <= 0){
		this.positionVX = (-this.positionVX);
		this.positionX = 0;
	}
	
	if(this.positionY >= this.movementBounds.bottom){
		// fly has hit bottom wall
		this.positionVY = (-this.positionVY);
		this.positionY = this.movementBounds.bottom;
	}
	else if(this.positionY < 0){
		// fly has hit left wall
		this.positionY = 0;
		this.positionVY = (-this.positionVY);
	}	
	
	return this;
 };