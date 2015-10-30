goog.provide('shoot_web.Web');
goog.require('lime.Circle');
 
shoot_web.Web = function() {
    goog.base(this);
	
	this.width = 50;
	this.height = 50;
	this.position_.x = 100;
	this.position_.y = 100;
	this.setSize(this.height, this.width);
	this.setFill('images/web-image.png');	
	this.radius = (this.width/2); // radius is half of width
}
 
goog.inherits(shoot_web.Web,lime.Circle);