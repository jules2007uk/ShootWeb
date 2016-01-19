//set main namespace
goog.provide('shoot_web');

//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');  
goog.require('lime.Circle');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.Loop');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');
goog.require('lime.transitions.MoveInUp');
	
// pull in custom js files
goog.require('shoot_web.Fly');
goog.require('shoot_web.Web');
goog.require('shoot_web.Game');


var director;

//object to store game-level properties
//var gameObj;

shoot_web.WIDTH = 768;
shoot_web.HEIGHT = 1004;

// entrypoint
shoot_web.start = function(){
	var gameScene;
	var mainMenuScene;
	
	/*
	gameObj = {
	  width: screen.width,
	  height: screen.height,	  
	  renderer: lime.Renderer.CANVAS //CANVAS or DOM		  
	};*/
										
	shoot_web.director = new lime.Director(document.body,shoot_web.WIDTH, shoot_web.HEIGHT);
	shoot_web.director.makeMobileWebAppCapable();	
	
	// build the main menu scene
	shoot_web.loadMenuScene();	
}

shoot_web.loadMenuScene = function(opt_transition){
	var scene = new lime.Scene();
    shoot_web.director.replaceScene(scene, opt_transition ? lime.transitions.MoveInDown : undefined);

    var layer = new lime.Layer().setPosition(shoot_web.WIDTH * .5, 0);
    scene.appendChild(layer);

    var title = new lime.Label().setText('Sticky Balls').setPosition(0, 250);
    layer.appendChild(title);


    var mask = new lime.Sprite().setSize(620, 560).setFill('#c00').setAnchorPoint(0.5, 0).setPosition(0, 410);
    layer.appendChild(mask);

    var contents = new lime.Layer().setPosition(0, 280);
    layer.appendChild(contents);

    contents.setMask(mask); 

	// add listener to background for game start action
	goog.events.listen(scene, ['touchstart', 'mousedown'], function(e) {
			e.event.stopPropagation();
			
			shoot_web.loadGame(1);
		});	

    var levels = new lime.Layer().setPosition(0, 690);
    contents.appendChild(levels);

    var lbl_levels = new lime.Label().setText(('Pick level:').toUpperCase()).setFontSize(30).setAnchorPoint(.5, 0).setPosition(0, 0).setFontColor('#fff');
    levels.appendChild(lbl_levels);

    var btns_layer = new lime.Layer().setPosition(-250, 110);
    levels.appendChild(btns_layer);
   
}

shoot_web.loadGame = function(level){	
	shoot_web.activeGame = new shoot_web.Game(level);
	shoot_web.director.replaceScene(shoot_web.activeGame, lime.transitions.MoveInUp);
}

/*
// reset the game round variables such as counters of webs and flies
resetGameRoundVariables = function(){
	flies = [];
	webs = [];
	webCount = 0; // the ongoing live count of total deployed webs
	expiredWebCount = 0; // the ongoing live count of expired webs
}*/

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('shoot_web.start', shoot_web.start);