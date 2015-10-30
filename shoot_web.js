//set main namespace
goog.provide('shoot_web');

//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');  
goog.require('lime.animation.MoveBy');
goog.require('lime.Circle');

// pull in custom js files
goog.require('shoot_web.Fly');
goog.require('shoot_web.Web');

// entrypoint
shoot_web.start = function(){
	//object to store game-level properties
	var gameObj = {
	  width: 520,
	  height: 480,
	  flies: [], // the flies to appear
	  webs: [],
	  renderer: lime.Renderer.CANVAS		  
	};

	var director = new lime.Director(document.body,gameObj.width,gameObj.height);
	var gameScene = new lime.Scene().setRenderer(gameObj.renderer)
	var gameLayer = new lime.Layer().setAnchorPoint(0,0);
  
	// create the game background and menu area
	var background = new lime.Sprite().setSize(gameObj.width,gameObj.height*4/5).setFill('#F3E2A9').setAnchorPoint(0,0).setPosition(0,0);
	var menuArea = new lime.Sprite().setSize(gameObj.width,gameObj.height/5).setFill('#8B5A00').setPosition(gameObj.width/2,gameObj.height*9/10)
	
	// set the movement boundary for the flies (e.g. the main game area)
	var flyMovementBounds = new goog.math.Box(0, gameObj.width, (gameObj.height*4/5), 0);
	
	// add click events to the background
	//goog.events.listen(background, ['touchstart', 'mousedown'], function(e) {				
	//});
	
	// now add the background and menu to the game layer
	gameLayer.appendChild(background);    
	gameLayer.appendChild(menuArea);	
	
	// create desired number of fly object and then add it to the gameObj flies array	
	for(i = 0; i < 100; i++){
		gameObj.flies.push(new shoot_web.Fly(gameObj, false, flyMovementBounds));
	}
	
	// append the flies to the game layer
	for(f = 0; f < gameObj.flies.length; f++){
		gameLayer.appendChild(gameObj.flies[f]);
	}	
	
	// DEBUG: add a web
	var web1 = new shoot_web.Web();
	gameObj.webs.push(web1);
	gameLayer.appendChild(web1);		
	
	// a timer which executes every 0.1 seconds and moves the position of the flies
	lime.scheduleManager.scheduleWithDelay(function() {
		// call a function to animate the flies
		for(f = 0; f < gameObj.flies.length; f++){
			// animate the fly and get the updated state of the fly
			if(gameObj.flies[f].isCaught == false){
				gameObj.flies[f] = gameObj.flies[f].animateFly(gameObj);
			}			
		}		
	});
		  
	gameScene.appendChild(gameLayer);
	director.makeMobileWebAppCapable();
	director.replaceScene(gameScene);
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('shoot_web.start', shoot_web.start);