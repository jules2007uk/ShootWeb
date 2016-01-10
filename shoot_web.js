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
var menuScoreBackgroundHexColour = '#D8F3ED';
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
var score = 0;

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
	
	/*mainScreenBackgroundGradient = new lime.fill.LinearGradient().
										setDirection(0,0,1,1). // 45' angle 
										addColorStop(0,96,206,201,0.9). // start from color (slightly transparent)
										addColorStop(1,0,0,100,1); // end with colour */
										
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
}

getLevelConfig = function(levelNumber){
	// to work out the number of flies required, round down levelNumber / 2, and then add 1 to it
	var numberOfFlies = (Math.floor(levelNumber/2) + 1);	
	var maxWebs = 1; //  always 1
	var targetCatches;
	
	if(isOdd(levelNumber)){
		// levelNumber is odd number so targetCatches is the same value as numberOfFlies
		targetCatches = numberOfFlies;
	}
	else{
		// levelNumber is an even number so targetCatches is the same value as numberOfFlies - 1
		targetCatches = (numberOfFlies - 1);
	}
	
	// create return object with level config
	levelConfig = {numberOfFlies: numberOfFlies, maxWebs: maxWebs, targetCatches: targetCatches}; // number of flies | max webs | target
	
	return levelConfig;
}

// quick function to determine if a number passed in is odd or even
function isOdd(num) { 
	return num % 2;
}

// reset the game round variables such as counters of webs and flies
resetGameRoundVariables = function(){
	flies = [];
	webs = [];
	webCount = 0; // the ongoing live count of total deployed webs
	expiredWebCount = 0; // the ongoing live count of expired webs
}

addModalMessage = function(doAddCloseHandler, gameLayer, message, title, message2, message3){
	// add transparent background to capture tap event - used for closing the modal
	var modalBackground = new lime.Sprite().setSize(gameObj.width, gameObj.height).setFill(menuHexColour).setAnchorPoint(0,0).setOpacity(0.5);
	
	// modal popup box, title, and primary message
	var modalPopup = new lime.Sprite().setSize(gameObj.width * 0.8,gameObj.height * 0.5).setFill(modalBackgroundHexColour).setPosition(gameObj.width/2,gameObj.height/2);
	var lblTitle = new lime.Label().setText(title).setPosition(0, - ((modalPopup.size_.height/2) - 20)).setFontColor(modalTextHexColour).setSize((modalPopup.size_.width * 0.9), 10).setFontWeight(600);
	var lblMessage = new lime.Label().setText(message).setPosition(0, (lblTitle.position_.y + lblTitle.size_.height) + 20).setFontColor(modalTextHexColour).setSize((modalPopup.size_.width * 0.9), 10).setAlign('center');
	
	modalPopup.appendChild(lblTitle);
	modalPopup.appendChild(lblMessage);
	
	// only add further messages to modal if parameters are defined
	if(message2 != undefined){
		var lblMessage2 = new lime.Label().setText(message2).setPosition(0, (lblMessage.position_.y + lblMessage.size_.height) + 30).setFontColor(modalTextHexColour).setSize((modalPopup.size_.width * 0.9), 10).setAlign('center');
		modalPopup.appendChild(lblMessage2);
	}	
	if(message3 != undefined){
		var lblMessage3 = new lime.Label().setText(message3).setPosition(0, (lblMessage2.position_.y + lblMessage2.size_.height) + 30).setFontColor(modalTextHexColour).setSize((modalPopup.size_.width * 0.9), 10).setAlign('center');
		modalPopup.appendChild(lblMessage3);
	}
	
	// add popup and background to gameLayer
	gameLayer.appendChild(modalPopup);
	gameLayer.appendChild(modalBackground);
	
	// do we want to add a tap handler to allow user to close the modal?
	if(doAddCloseHandler){
		// add event listener to capture any click on the modal background
		goog.events.listen(modalBackground, ['touchstart', 'mousedown'], function(e, gameScene) {
			e.event.stopPropagation();		
					
			// remove popup and background from gameLayer
			gameLayer.removeChild(modalPopup);
			gameLayer.removeChild(modalBackground);
		});
	}
}

startMainMenu = function(){
	var gameScene = new lime.Scene().setRenderer(gameObj.renderer);
	var gameLayer = new lime.Layer().setAnchorPoint(0,0);
	
	// create the game background and menu area
	var background = new lime.Sprite().setSize(gameObj.width,gameObj.height).setAnchorPoint(0,0).setPosition(0,0);
	var title = new lime.Label().setText('Ball Catch').setPosition(gameObj.width/2,gameObj.height/2).setFontColor(mainScreenFontColour).setFontSize(30).setFontWeight(600);
	var globalHighScore = new lime.Label().setText('Global High Score: 99').setPosition(gameObj.width/2, (title.position_.y + title.fontSize_ + 40)).setFontColor(mainScreenFontColour).setFontSize(30);
	var instructions = new lime.Label().setText('Tap anywhere to start').setPosition(gameObj.width/2, (globalHighScore.position_.y + globalHighScore.fontSize_ + 40)).setFontColor(mainScreenFontColour).setFontSize(30);
	
	// add title
	background.appendChild(title);
	background.appendChild(instructions);
	background.appendChild(globalHighScore);
	
	// now add the background and menu to the game layer
	gameLayer.appendChild(background);
	
	gameScene.appendChild(gameLayer);
	
	// DEBUG - show help modal
	//addModalMessage(true, gameLayer, 'Place one sticky ball per round by tapping in the game area.', 'How to play', 'Wait for loose balls to collide with the sticky ball, before it expires.', 'Catch the target amount of balls per round to progress to the next round. Verbose text in here to see what happens');
	
	// add event listener to capture any click on the main menu background
	goog.events.listen(background, ['touchstart', 'mousedown'], function(e, gameScene) {
		e.event.stopPropagation();
		
		director.popScene(gameScene);	
	});
	
	return gameScene;
}

startNewRound = function(gameObj, levelSettings){		
	var gameScene = new lime.Scene().setRenderer(gameObj.renderer);	
	var background = new lime.Sprite().setSize(gameObj.width,gameObj.height*4/5).setFill(gameAreaHexColour).setAnchorPoint(0,0).setPosition(0,0);
	var menuArea = new lime.Sprite().setSize(gameObj.width,gameObj.height/5).setFill(menuHexColour).setPosition(gameObj.width/2,gameObj.height*9/10);	
	var flyMovementBounds = new goog.math.Box(0, gameObj.width, (gameObj.height*4/5), 0); // set the movement boundary for the flies (e.g. the main game area)
	var targetMenuLabel = new lime.Label().setFontSize(30).setText('Target catches: ' + levelSettings.targetCatches).setPosition(menuArea.position_.x, menuArea.position_.y - 30).setFontColor('#000000').setFill(menuScoreBackgroundHexColour).setPadding(5, 5, 5, 5).setAlign('left').setStroke(2, '#c5ede4');
	var currentScoreLabel = new lime.Label().setFontSize(30).setText('Current score: ' + score).setPosition(targetMenuLabel.position_.x, targetMenuLabel.position_.y + 60).setFontColor('#000000').setFill(menuScoreBackgroundHexColour).setPadding(5, 5, 5, 5).setAlign('left').setStroke(2, '#c5ede4');
		
	// reset the game round variables such as ongoing counts of webs/flies, etc.
	resetGameRoundVariables();	
	
	gameLayer = new lime.Layer().setAnchorPoint(0,0);
	
	// add click events to the background
	goog.events.listen(background, ['touchstart', 'mousedown'], function(e) {		
		e.event.stopPropagation();
		
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
	gameLayer.appendChild(currentScoreLabel);
	
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
			
			// round is now over
			if((webCount - 1) < levelConfig.targetCatches){
				// you lost
				// set level count back to 1
				level = 1;
				
				addModalMessage(false, gameLayer, score + ' pts', 'Game over');
				
				// 4 sceond timer
				lime.scheduleManager.callAfter(function(){
					
					// restart the game which will kick the player back to the main menu
					location.reload();
					
					// fetch next level settings and start new round				
					//var newRound = startNewRound(gameObj, getLevelConfig(level));
					//director.replaceScene(newRound);
					
				}, ctx, 4000);
			}
			else{				
				// increment game to next level up
				level += 1;				
				
				// append to the user's score in this game so far
				appendToScore(flies);
				
				// start the next round
				var newRound = startNewRound(gameObj, getLevelConfig(level));
				director.replaceScene(newRound);
			}			
			
		}
	}
}

// appends to the user's score
appendToScore = function(fliesInRound){
	
	// each captured fly is worth 50pts, and catching all flies is worth an extra 25pts	
	var potentialNumberCatches = fliesInRound.length;
	var actualNumberCatches = 0;	
	
	for(i = 0; i < potentialNumberCatches; i++){
		
		if(fliesInRound[i].isCaught){
			actualNumberCatches += 1;
		}
	}
	
	// add 50pts for each one caught
	score += (actualNumberCatches * 50);
	
	// if player has caught all available flies then add an extra 25pts
	if(potentialNumberCatches == actualNumberCatches){
		score += 25;
	}
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('shoot_web.start', shoot_web.start);