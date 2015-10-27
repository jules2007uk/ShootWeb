goog.provide('shoot_web.Wall');
// inherits from lime.Sprite which allows creation of rectangles, images, etc.
goog.require('lime.Sprite');
 
shoot_web.Wall = function() {
    goog.base(this);
	
	//this.setFill('#FF2200').setSize(20,20);
}
 
goog.inherits(shoot_web.Wall,lime.Sprite);