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

var modalBackgroundHexColour = '#55BDA4';
var modalTextHexColour = '#B1EAE1';
var menuHexColour = '#ECF9F6';
var menuFontHexColour = '#B1EAE1';
var gameAreaHexColour = '#60CEB5';
var flies = [];
var webs = [];
var webCount = 0; // the ongoing live count of total deployed webs
var expiredWebCount = 0; // the ongoing live count of expired webs
var ctx;
var levelConfig;
var gameLayer;
var director;
var level = 1;
var mainScreenBackgroundGradient;
var mainScreenFontColour = '#FFFDFC';

//object to store game-level properties
var gameObj;

// entrypoint
shoot_web.start = function(){
	var gameScene;
	var mainMenuScene;
	
	gameObj = {
	  width: screen.width,
	  height: screen.height,	  
	  renderer: lime.Renderer.CANVAS //CANVAS or DOM		  
	};
	
	mainScreenBackgroundGradient = new lime.fill.LinearGradient().
										setDirection(0,0,1,1). // 45' angle 
										addColorStop(0,100,0,0,0.9). // start from red color (slightly transparent)
										addColorStop(1,0,0,100,1); // end with blue*/
										
	director = new lime.Director(document.body,gameObj.width,gameObj.height);
	
	director.makeMobileWebAppCapable();
	
	// get the level settings for level 1 then pass to function to start a new round
	levelConfig = getLevelConfig(level);
	
	// passes back variable to build the game scene
	gameScene = startNewRound(gameObj, levelConfig);
	
	// build the main menu scene
	mainMenuScene = startMainMenu();
	
	// show the game scene
	director.replaceScene(gameScene);
	
	// show the menu scene (keeping the game scene in the background)
	director.pushScene(mainMenuScene);
	
	// add event listener to capture any click on the main menu
	goog.events.listen(mainMenuScene, ['touchstart', 'mousedown'], function(e, gameScene) {
		e.stopPropagation();
		//e.event.preventDefault();
		director.popScene(gameScene);	
	});
}

getLevelConfig = function(levelNumber){
	var numberOfFlies =(levelNumber + 2);
	var maxWebs = 1;
	var targetCatches = Math.ceil(numberOfFlies / 2);	
	
	// create return object with level config
	levelConfig = {numberOfFlies: numberOfFlies, maxWebs: maxWebs, targetCatches: targetCatches}; // number of flies | max webs | target
	
	return levelConfig;
}

// reset the game round variables such as counters of webs and flies
resetGameRoundVariables = function(){
	flies = [];
	webs = [];
	webCount = 0; // the ongoing live count of total deployed webs
	expiredWebCount = 0; // the ongoing live count of expired webs
}

addModalMessage = function(gameLayer, message){
	// modal popup box
	var modalPopup = new lime.Sprite().setSize(gameObj.width * 0.8,gameObj.height * 0.3).setFill(modalBackgroundHexColour).setPosition(gameObj.width/2,gameObj.height/2);
	// text to add to the modal popup
	var title = new lime.Label().setText(message).setPosition(gameObj.width/2,gameObj.height/2).setFontColor(modalTextHexColour);
	// add transparent background to prevent tapping to create a web
	//var modalBackground = new lime.Sprite().setSize(gameObj.width, gameObj.height).setFill(menuHexColour).setAnchorPoint(0,0).setOpacity(0.5);	
	
	gameLayer.appendChild(modalPopup);
	gameLayer.appendChild(title);
	//gameLayer.appendChild(modalBackground);
	
	/*// add tap event to the modal background to remove the modal on tap
	goog.events.listen(modalBackground, ['touchstart', 'mousedown'], function(e) {		
		e.stopPropagation();
		//e.event.preventDefault();
		gameLayer.removeChild(modalBackground);		
	});*/
}

startMainMenu = function(){
	var gameScene = new lime.Scene().setRenderer(gameObj.renderer);
	var gameLayer = new lime.Layer().setAnchorPoint(0,0);
  
	
	// example of how to set a background image
	//var background = new lime.Sprite().setFill('http://www.androidtapp.com/wp-content/uploads/2011/11/NodeBeat-Splash-screen.jpg').setAnchorPoint(0,0).setPosition(0,0).setSize(gameObj.width, gameObj.height);	
	
	// create the game background and menu area
	var background = new lime.Sprite().setSize(gameObj.width,gameObj.height).setFill(mainScreenBackgroundGradient).setAnchorPoint(0,0).setPosition(0,0);
	var title = new lime.Label().setText('Ball Catch').setPosition(gameObj.width/2,gameObj.height/2).setFontColor(mainScreenFontColour);
	var instructions = new lime.Label().setText('Tap anywhere to start').setPosition(gameObj.width/2,(gameObj.height/1.5)).setFontColor(mainScreenFontColour);
	
	// add title
	background.appendChild(title);
	background.appendChild(instructions);
	
	// now add the background and menu to the game layer
	gameLayer.appendChild(background); 	 
	gameScene.appendChild(gameLayer);	
	
	goog.events.listen(gameScene, ['touchstart', 'mousedown'], function(e) {
		//startNewRound();
	});
	
	return gameScene;
}

startNewRound = function(gameObj, levelSettings){		
	var gameScene = new lime.Scene().setRenderer(gameObj.renderer);	
	var background = new lime.Sprite().setSize(gameObj.width,gameObj.height*4/5).setFill(gameAreaHexColour).setAnchorPoint(0,0).setPosition(0,0);
	var menuArea = new lime.Sprite().setSize(gameObj.width,gameObj.height/5).setFill(menuHexColour).setPosition(gameObj.width/2,gameObj.height*9/10);	
	var flyMovementBounds = new goog.math.Box(0, gameObj.width, (gameObj.height*4/5), 0); // set the movement boundary for the flies (e.g. the main game area)
	var targetMenuLabel = new lime.Label().setText('Target collisions: ' + levelSettings.targetCatches).setPosition(menuArea.position_.x, menuArea.position_.y).setFontColor('#000000').setFill(menuHexColour).setPadding(5, 5, 5, 5).setAlign('left').setStroke(1, '#000000');
		
	// reset the game round variables such as ongoing counts of webs/flies, etc.
	resetGameRoundVariables();	
	
	gameLayer = new lime.Layer().setAnchorPoint(0,0);
	
	// add click events to the background
	goog.events.listen(background, ['touchstart', 'mousedown'], function(e) {		
		e.stopPropagation();
		
		// only add a web to the game if we haven't already added the max number of allowed webs already
		if(webCount < levelSettings.maxWebs){
			var playerPositionWeb = new shoot_web.Web(e.position.x, e.position.y, null);			
			webs.push(playerPositionWeb);
			gameLayer.appendChild(playerPositionWeb);
			
			// increment web count
			webCount += 1;
		}	
	});
	
	// now add the background and menu to the game layer
	gameLayer.appendChild(background);    
	gameLayer.appendChild(menuArea);
	gameLayer.appendChild(targetMenuLabel);
	//gameLayer.appendChild(collisionsMenuLabel);
	
	// create desired number of fly object and then add it to the gameObj flies array	
	for(i = 0; i < levelSettings.numberOfFlies; i++){		
		flies.push(new shoot_web.Fly(gameObj, false, flyMovementBounds));		
	}
	
	// append the flies to the game layer
	for(f = 0; f < levelSettings.numberOfFlies; f++){
		gameLayer.appendChild(flies[f]);		
	}	
	
	// assign this to a variable to hold the current context so that the context can be passed when unscheduling the function later when the round is finished
	ctx = this;
	
	// a timer which executes every 0.1 seconds
	lime.scheduleManager.scheduleWithDelay(updateGameFrame, ctx);
		  
	gameScene.appendChild(gameLayer);
	
	return gameScene;
}

updateGameFrame = function(){
	
	// call a function to animate the flies
	for(f = 0; f < flies.length; f++){
		
		// animate the fly and get the updated state of the fly
		if(!flies[f].isCaught){				
			var updatedFlyInstance = flies[f].animateFly(gameObj, webs);
			flies[f] = updatedFlyInstance;
			
			// now that the fly has animated we need to again check the caught state, because if caught now then we need to show a new web
			if(updatedFlyInstance.isCaught == true){
				// show a new web, the fly was caught					
				var dynamicWeb = new shoot_web.Web(updatedFlyInstance.positionX, updatedFlyInstance.positionY, updatedFlyInstance, webCount);
				webs.push(dynamicWeb);
				
				// remove fly
				gameLayer.removeChild(updatedFlyInstance);
				
				// add web
				gameLayer.appendChild(dynamicWeb);
				
				// increment web count
				webCount += 1;					
			}	
		}	
		
		// iterate all webs and expire them if they've lived for too long
		for(w = 0; w < webCount; w++){					
			var iteratedWeb = webs[w];
			
			// check for any webs not yet expired
			if(iteratedWeb.isExpired == false){
				if((new Date().getTime() - iteratedWeb.deployedTime) >= 3000){
					iteratedWeb.expireWeb(gameLayer);
					
					// increment count of expired webs
					expiredWebCount += 1;
				}
			}
		}

		// if all webs are expired then we need to end the round
		if((webCount > 0) && expiredWebCount == webCount){
						
			// immediately stop the parent function 'updateGameFrame' from being called by the timer, because the round is over
			lime.scheduleManager.unschedule(updateGameFrame, ctx);
			
			// round over - now what?
			if((webCount - 1) < levelConfig.targetCatches){
				// you lost
				// set level count back to 1
				level = 1;

				addModalMessage(gameLayer, 'Game over <score> pts');
				
				lime.scheduleManager.callAfter(function(){
																		
					// fetch next level settings and start new round				
					var newRound = startNewRound(gameObj, getLevelConfig(level));
					director.replaceScene(newRound);
					
				}, ctx, 4000);
			}
			else{				
				// increment game to next level up
				level += 1;
				
				addModalMessage(gameLayer, 'Round won');
				
				// start the next round
				var newRound = startNewRound(gameObj, getLevelConfig(level));
				director.replaceScene(newRound);
			}			
			
		}
	}
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('shoot_web.start', shoot_web.start);