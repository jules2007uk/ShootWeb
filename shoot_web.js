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

var menuHexColour = '#0A0F0F';
var gameAreaHexColour = '#F0F5F5';

// entrypoint
shoot_web.start = function(){
	//object to store game-level properties
	var gameObj = {
	  width: 520,
	  height: 480,	  
	  renderer: lime.Renderer.CANVAS //CANVAS or DOM		  
	};	
	
	var director = new lime.Director(document.body,gameObj.width,gameObj.height);
	var gameScene;
	var mainMenuScene;
	
	director.makeMobileWebAppCapable();
	
	// get the level settings for level 1 then pass to function to start a new round	
	// passes back variable to build the game scene
	gameScene = startNewRound(gameObj, getLevelConfig(1));
	
	// build the main menu scene
	mainMenuScene = startMainMenu(gameObj);
	
	// show the menu scene
	//director.replaceScene(mainMenuScene);	
	
	// show the game scene
	director.replaceScene(gameScene);	
}

getLevelConfig = function(levelNumber){
	var numberOfFlies =(levelNumber * 2);
	var maxWebs = 1;
	var targetCatches = Math.ceil(numberOfFlies / 2);	
	
	// create return object with level config
	var levelConfig = {numberOfFlies: numberOfFlies, maxWebs: maxWebs, targetCatches: targetCatches}; // number of flies | max webs | target
	return levelConfig;
}

startMainMenu = function(gameObj){
	var gameScene = new lime.Scene().setRenderer(gameObj.renderer);
	var gameLayer = new lime.Layer().setAnchorPoint(0,0);
  
	// create the game background and menu area
	var background = new lime.Sprite().setSize(gameObj.width,gameObj.height).setFill(menuHexColour).setAnchorPoint(0,0).setPosition(0,0);	
	var title = new lime.Label().setText('COLLISION').setPosition(gameObj.width/2,gameObj.height/2).setFontColor(gameAreaHexColour);
	var instructions = new lime.Label().setText('Tap anywhere to start').setPosition(gameObj.width/2,(gameObj.height/1.5)).setFontColor(gameAreaHexColour);
	
	// add title
	background.appendChild(title);
	background.appendChild(instructions);
	
	// now add the background and menu to the game layer
	gameLayer.appendChild(background); 	 
	gameScene.appendChild(gameLayer);	
	
	goog.events.listen(gameScene, ['touchstart', 'mousedown'], function(e) {
		startNewRound();
	});
	
	return gameScene;
}

startNewRound = function(gameObj, levelSettings){
		
	var gameScene = new lime.Scene().setRenderer(gameObj.renderer);
	var gameLayer = new lime.Layer().setAnchorPoint(0,0);
	var webCount = 0; // the ongoing live count of total deployed webs
	var expiredWebCount = 0; // the ongoing live count of expired webs
  
	// create the game background and menu area
	var background = new lime.Sprite().setSize(gameObj.width,gameObj.height*4/5).setFill(gameAreaHexColour).setAnchorPoint(0,0).setPosition(0,0);
	var menuArea = new lime.Sprite().setSize(gameObj.width,gameObj.height/5).setFill(menuHexColour).setPosition(gameObj.width/2,gameObj.height*9/10)
	
	// set the movement boundary for the flies (e.g. the main game area)
	var flyMovementBounds = new goog.math.Box(0, gameObj.width, (gameObj.height*4/5), 0);
	var flies = [];
	var webs = [];
	
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
	
	// create desired number of fly object and then add it to the gameObj flies array	
	for(i = 0; i < levelSettings.numberOfFlies; i++){
		flies.push(new shoot_web.Fly(gameObj, false, flyMovementBounds));
	}
	
	// append the flies to the game layer
	for(f = 0; f < levelSettings.numberOfFlies; f++){
		gameLayer.appendChild(flies[f]);
	}
	
	// a timer which executes every 0.1 seconds
	lime.scheduleManager.scheduleWithDelay(function() {		
		var flyCount = flies.length;
		
		// call a function to animate the flies
		for(f = 0; f < flyCount; f++){
			
			// animate the fly and get the updated state of the fly
			if(!flies[f].isCaught){				
				var updatedFlyInstance = flies[f].animateFly(gameObj, webs);
				flies[f] = updatedFlyInstance;
				
				// now that the fly has animated we need to again check the caught state, because if caught now then we need to show a new web
				if(updatedFlyInstance.isCaught == true){
					// show a new web, the fly was caught					
					var dynamicWeb = new shoot_web.Web(updatedFlyInstance.positionX, updatedFlyInstance.positionY, updatedFlyInstance);
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
				// round over - now what?
				if((webCount - 1) < levelSettings.targetCatches){
					alert('You lose');
				}
				else{
					alert('You won');
					
					/*var gs;
					gs = startNewRound(gameObj, getLevelConfig(2));
					director.replaceScene(gameScene);*/	
				}
			}
		}		
	});
		  
	gameScene.appendChild(gameLayer);
	return gameScene;
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('shoot_web.start', shoot_web.start);