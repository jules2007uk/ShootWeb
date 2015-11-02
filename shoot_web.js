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
	  renderer: lime.Renderer.CANVAS		  
	};

	var numberOfFlies = 10;
	var maxWebs = 1; // define the max number of webs allowed in case this needs to be configured
	var webCount = 0; // the ongoing live count of total deployed webs
	var expiredWebCount = 0;
	var director = new lime.Director(document.body,gameObj.width,gameObj.height);
	var gameScene;
	var mainMenuScene;
	
	director.makeMobileWebAppCapable();
	
	// build the game scene
	gameScene = startNewRound(gameObj, numberOfFlies, maxWebs, webCount, expiredWebCount);
	
	// build the main menu scene
	mainMenuScene = startMainMenu(gameObj);
	
	// show the menu scene
	director.replaceScene(gameScene);	
}

startMainMenu = function(gameObj){
	var gameScene = new lime.Scene().setRenderer(gameObj.renderer);
	var gameLayer = new lime.Layer().setAnchorPoint(0,0);
  
	// create the game background and menu area
	var background = new lime.Sprite().setSize(gameObj.width,gameObj.height).setFill('#FCCC49').setAnchorPoint(0,0).setPosition(0,0);	
	var title = new lime.Label().setText('Shoot Web').setPosition(200,200);
	
	// add title
	background.appendChild(title);
	
	// now add the background and menu to the game layer
	gameLayer.appendChild(background);    
	
	 
	gameScene.appendChild(gameLayer);
	return gameScene;
}

startNewRound = function(gameObj, numberOfFlies, maxWebs, webCount, expiredWebCount){
		
	var gameScene = new lime.Scene().setRenderer(gameObj.renderer);
	var gameLayer = new lime.Layer().setAnchorPoint(0,0);
  
	// create the game background and menu area
	var background = new lime.Sprite().setSize(gameObj.width,gameObj.height*4/5).setFill('#F3E2A9').setAnchorPoint(0,0).setPosition(0,0);
	var menuArea = new lime.Sprite().setSize(gameObj.width,gameObj.height/5).setFill('#8B5A00').setPosition(gameObj.width/2,gameObj.height*9/10)
	
	// set the movement boundary for the flies (e.g. the main game area)
	var flyMovementBounds = new goog.math.Box(0, gameObj.width, (gameObj.height*4/5), 0);
	var flies = [];
	var webs = [];
	
	// add click events to the background
	goog.events.listen(background, ['touchstart', 'mousedown'], function(e) {
		e.stopPropagation();
		
		// only add a web to the game if we haven't already added the max number of allowed webs already
		if(webCount < maxWebs){
			var playerPositionWeb = new shoot_web.Web(e.position.x, e.position.y);			
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
	for(i = 0; i < numberOfFlies; i++){
		flies.push(new shoot_web.Fly(gameObj, false, flyMovementBounds));
	}
	
	// append the flies to the game layer
	for(f = 0; f < numberOfFlies; f++){
		gameLayer.appendChild(flies[f]);
	}
	
	// a timer which executes every 0.1 seconds
	lime.scheduleManager.scheduleWithDelay(function() {
		// call a function to animate the flies
		for(f = 0; f < flies.length; f++){
			
			// animate the fly and get the updated state of the fly
			if(flies[f].isCaught == false){
				var updatedFlyInstance = flies[f].animateFly(gameObj, webs);
				flies[f] = updatedFlyInstance;
				
				// now that the fly has animated we need to again check the caught state, because if caught now then we need to show a new web
				if(updatedFlyInstance.isCaught == true){
					// show a new web, the fly was caught
					var dynamicWeb = new shoot_web.Web(flies[f].positionX, flies[f].positionY);
					webs.push(dynamicWeb);
					gameLayer.appendChild(dynamicWeb);
					
					// increment web count
					webCount += 1;
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
					console.log('round over');
				}
			}			
		}		
	});
		  
	gameScene.appendChild(gameLayer);
	return gameScene;
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('shoot_web.start', shoot_web.start);