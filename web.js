goog.provide('shoot_web.Web');
goog.require('lime.Circle');
 
shoot_web.Web = function(x, y, flyInstance, webNumber) {
    goog.base(this);
	
	this.width = gameObj.width/6; // TODO: Set to gameObj.width/6 if orientation = Portrait, else use gameObj.height/6
	this.height = this.width;
	this.position_.x = x;
	this.position_.y = y;
	this.setSize(this.height, this.width);
	this.radius = (this.width/2); // radius is half of width
	this.deployedTime = new Date().getTime();
	this.isExpired = false;
	this.webNumber = webNumber; // the number which corresponds to the order of when the web was caught
	
	if(flyInstance != null){
		
		// set background color according to fly background colour		
		var b = flyInstance.fill_.colors_[0][1].b;
		var g = flyInstance.fill_.colors_[0][1].g;
		var r = flyInstance.fill_.colors_[0][1].r;
		
		// fill background 
		var gradient = new lime.fill.LinearGradient()
			.setDirection(0,0,1,1) // 45' angle 
			.addColorStop(0, r, g, b ,.5) // add colour			
		this.setFill(gradient);
	}
	else{
		// set default background colour
		this.setFill('#0A0F0F');
	}
	
	if(webNumber != undefined){
		// create a new label to hold the web number
		var numberLabel = new lime.Label().setText(this.webNumber);
		
		// add web number labelt to the web
		this.appendChild(numberLabel);
	}	
	
}
 
goog.inherits(shoot_web.Web,lime.Circle);

shoot_web.Web.prototype.expireWeb = function(gameLayer) {	

	// mark the web as expired
	this.isExpired = true;

	// remove the web from the UI (actually could do with some nice animation)
	gameLayer.removeChild(this);
}