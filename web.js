goog.provide('shoot_web.Web');
goog.require('lime.Circle');
 
shoot_web.Web = function(x, y) {
    goog.base(this);
	
	this.width = 50;
	this.height = 50;
	this.position_.x = x;
	this.position_.y = y;
	this.setSize(this.height, this.width);
	this.setFill('images/web-image.png');	
	this.radius = (this.width/2); // radius is half of width
}
 
goog.inherits(shoot_web.Web,lime.Circle);