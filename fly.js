goog.provide('shoot_web.Fly');
// inherits from lime.Sprite which allows creation of rectangles, images, etc.
goog.require('lime.Sprite');
 
shoot_web.Fly = function(gameObj, isCaught, movementBounds) {
    goog.base(this);

	// define the properties of the fly	
	this.isCaught = isCaught; // is the fly caught in the web?
	this.height = gameObj.height/50;
	this.width = gameObj.height/50;
	this.setSize(this.width, this.height);	// the size of the fly
	
	// set the starting coordinates for the fly before animation
	this.positionX = Math.floor(Math.random() * movementBounds.right) + 1;
	this.positionY = Math.floor(Math.random() * movementBounds.bottom) + 1;
	
	// set the X and Y vectors
	this.positionVX = Math.floor(Math.random() * 2) + 1;
	this.positionVY = Math.floor(Math.random() * 4) + 1;
	
	// set the boundaries within which the fly can move
	this.movementBounds = movementBounds;		
	
	// create a random Hex colour and assign it as the background colour of the fly
	this.setFill('#'+Math.floor(Math.random()*16777215).toString(16));
}
 
goog.inherits(shoot_web.Fly,lime.Sprite);

/**
 * Start new fly animation
 **/
 shoot_web.Fly.prototype.animateFly = function() {	
	/*
	// add listener event for the animation stop event
	goog.events.listen(flyMovement,lime.animation.Event.STOP,function(){
		// fly has finished moving
	});
	*/
	
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
 };