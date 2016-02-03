goog.provide('shoot_web.Web');
goog.require('lime.Circle');
 
shoot_web.Web = function(x, y, flyInstance, webNumber) {
    goog.base(this);
	
	this.width = 100;
	this.height = 100;
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
		// create new labels to hold the web number and points value respectively
		var numberLabel = new lime.Label().setText(this.webNumber).setFontWeight(600).setFontColor('#FCE9A4').setFontSize('20').setOpacity(0);
		var pointsLabel = new lime.Label().setText('+50pts').setFontWeight(600).setFontColor('#5e8d0c').setFontSize('30');
		
		// define animation actions (hide and appear respectively
		var hide = new lime.animation.Sequence(new lime.animation.Delay().setDuration(0.5), new lime.animation.FadeTo(0).setDuration(.5));
		var appear = new lime.animation.FadeTo(1).setDuration(1);
				
		// add labels
		this.appendChild(numberLabel);
		this.appendChild(pointsLabel);
		
		// run animation on labels
		numberLabel.runAction(appear);
		pointsLabel.runAction(hide);
	}	
	
}
 
goog.inherits(shoot_web.Web,lime.Circle);

shoot_web.Web.prototype.expireWeb = function(ctx) {	

	// mark the web as expired
	this.isExpired = true;

	// remove the web from the UI (actually could do with some nice animation)
	ctx.removeChild(this);
}