goog.provide('shoot_web.Game');

goog.require('lime.GlossyButton');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.Spawn');
goog.require('lime.CanvasContext');
goog.require('shoot_web.dialogs');

shoot_web.Game = function(level) {
    lime.Scene.call(this);
	lime.Renderer.CANVAS;
	
	this.setRenderer(lime.Renderer.CANVAS);	
	this.WIDTH = 600;      
	this.level = level;	
	this.bestScore = 0;
	
	this.mask = new lime.Sprite().setFill(new lime.fill.LinearGradient().addColorStop(0.5, 224, 224, 224, .5).addColorStop(0.8, 192, 192, 192, .5)).setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    this.appendChild(this.mask);	
	this.mask = new lime.Sprite().setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    this.appendChild(this.mask);	
	this.layer = new lime.Layer();    
    this.appendChild(this.layer);
    this.layer.setMask(this.mask);
    this.layer.setOpacity(.5);	
	this.cover = new lime.Layer().setPosition(shoot_web.director.getSize().width / 2, 0);
    this.appendChild(this.cover);	
	
	// create an empty label to hold the score
	lblScore = new lime.Label().setText('').setFontSize(44).setPosition(50, 0).setFontColor('#C0C0C0').setAlign('right').setAnchorPoint(0, 0);
    this.appendChild(lblScore);
	
	// create an empty label to hold the user's best score
	lblUserHighScore = new lime.Label().setText('').setFontSize(44).setPosition(500, 0).setFontColor('#C0C0C0').setAlign('right').setAnchorPoint(0, 0);
	this.appendChild(lblUserHighScore);

	// create an empty label to hold the level number
	lblLevel = new lime.Label().setText('').setFontSize(44).setPosition(50, 950).setFontColor('#C0C0C0').setAlign('right').setAnchorPoint(0, 0);
	this.appendChild(lblLevel);
	
	lblTargetCatches = new lime.Label().setText('').setFontSize(44).setPosition(500, 950).setFontColor('#C0C0C0').setAlign('right').setAnchorPoint(0, 0);
	this.appendChild(lblTargetCatches);
	
	// set the movement boundary for the flies (e.g. the main game area)	
	this.flyMovementBounds = new goog.math.Box(130, this.mask.size_.width, this.mask.size_.height + 130, 0);
	
	// game config properties
	this.numberOfFlies = 0;	
	this.targetCatches = 0;
	this.webCount = 0;
	this.webs = [];
	this.flies = [];
	this.maxWebs = 1;	
	this.roundCatchCount = 0;
	this.expiredWebCount = 0;
	this.score = 0;
	this.configLevelNumber = 0; // to hold the config level (e.g. difficulty)
	this.topConfigLevel = 20;	// specify the top config level (e.g. difficulty)
	
	// divide the level number by the top config level to ascertain the remainder, which we then use as the configLevel value
	var remainder = this.level % this.topConfigLevel;
	
	// if the remainder is 0
	if(remainder == 0){
		// this means that the current level is the top level achievable, therefore set config level to 
		this.configLevelNumber = this.topConfigLevel;
	}
	else{
		// else set the config level number to be the remainder value
		// (e.g. remainder would be 6 if level was 26 and top config level was 20)
		this.configLevelNumber = remainder;
	}
	
	// target catches is the same as the config level number
	this.targetCatches = this.configLevelNumber;
	
	// calculate how many available flies to catch
	// the formaula below calculates the following level config:
	/*
		configLevel	Target	Balls
		1			1		2
		2			2		4
		3			3		6
		4			4		8
		5			5		10
		6			6		12
		7			7		14
		8			8		16
		9			9		18
		10			10		20
		11			11		20
		12			12		20
		13			13		20
		14			14		20
		15			15		20
		16			16		20
		17			17		20
		18			18		20
		19			19		20
		20			20		20
	*/
	if(this.configLevelNumber <= 10){
		this.numberOfFlies = (this.configLevelNumber * 2);
	}
	else{
		this.numberOfFlies = 20;
	}
	
    // the level number tells us to display either the level, the how to play, or global leaderboard screens respectively
	if(this.level == 0){
		this.showHowToPlay();
	}
	else if (this.level == -1) {
	    this.showGlobalLeaderboard();
	}
	else if (this.level > 0) {
		this.start();
	}
	
}

goog.inherits(shoot_web.Game,lime.Scene);

// retrieve best score stored in local storage
shoot_web.Game.prototype.getBestScore = function(){
	var scoreRetrieved = localStorage.getItem("UserBestScore");
	
	if(scoreRetrieved != null){
		return scoreRetrieved;
	}
	else{
		return 0;
	}
}

// set best score in local storage
shoot_web.Game.prototype.setBestScore = function(scoreToAdd){	
	localStorage.setItem("UserBestScore", scoreToAdd);
}

// start the game
shoot_web.Game.prototype.start = function() {	
	
	// get user's high score from localStorage
	this.bestScore = this.getBestScore();

	// set user high score to label text if found in local storage
	lblUserHighScore.setText('Best: ' + this.bestScore);		
	
	// set label text for score
	lblScore.setText('Score: ' + runningScore);
	
	// set label text for level
	lblLevel.setText('Level: ' + this.level);
	
	// set target catches label text
	lblTargetCatches.setText('Catch: ' + this.targetCatches);
	
	// add click event to the game area for player main web placement
	goog.events.listen(this.mask, ['mousedown', 'touchstart', 'keydown'], this.addMainWeb, false, this);		 
		 
	// create desired number of fly object and then add it to the gameObj flies array	
	for(i = 0; i < this.numberOfFlies; i++){		
		this.flies.push(new shoot_web.Fly(false, this.flyMovementBounds));		
	}
	
	// append the flies to the game area
	for(f = 0; f < this.numberOfFlies; f++){
		this.appendChild(this.flies[f]);			
	}	
	
	// add scheduled call to updateGameFrame which refreshes the game UI
	lime.scheduleManager.scheduleWithDelay(this.updateGameFrame, this);
		
};

shoot_web.Game.prototype.showHowToPlay = function(){
	var show = new lime.animation.MoveBy(0, 50).setDuration(1.5);
	var box = shoot_web.dialogs.box1();
	this.cover.appendChild(box);
	var that = this;    
	
	//goog.events.listen(show, lime.animation.Event.STOP, function() {
        shoot_web.dialogs.appear(box);

        var box2 = shoot_web.dialogs.box2();
        shoot_web.dialogs.hide(box, function() {
            that.cover.removeChild(box);
            that.cover.appendChild(box2);
            shoot_web.dialogs.appear(box2);

            var box3 = shoot_web.dialogs.box3(that);
            shoot_web.dialogs.hide(box2, function() {
                that.cover.removeChild(box2);
                that.cover.appendChild(box3);
                shoot_web.dialogs.appear(box3);

                shoot_web.dialogs.hide(box3, function() {
                    that.cover.removeChild(box3);
                    that.cover.removeChild(lblScore);
                    location.reload();
                });

            });

        });				
    //});
}

// function to show the global leaderboard popup screen
shoot_web.Game.prototype.showGlobalLeaderboard = function () {
    var show = new lime.animation.MoveBy(0, 50).setDuration(1.5);
    var box = shoot_web.dialogs.box5();
    this.cover.appendChild(box);
    var that = this;
    
    // show the box
    shoot_web.dialogs.appear(box);
	
	shoot_web.dialogs.hide(box, function() {
		that.cover.removeChild(box);		
		location.reload();
	});
}

shoot_web.Game.prototype.updateGameFrame = function(){
	
	// for each fly animate the fly (e.g. move their position) and get the updated state of the fly
	for(f = 0; f < this.flies.length; f++){
		
		// check if the currently iterated fly has been caught
		// if the fly has been caught then ignore it
		if(!this.flies[f].isCaught){
			
			// animate the fly and pass back the fly instance into the flies collection
			var updatedFlyInstance = this.flies[f].animateFly(this.webs);
			this.flies[f] = updatedFlyInstance;
						
			// now that the fly has animated we need to again check the caught state, because if caught now then we need to show a new web
			if(updatedFlyInstance.isCaught == true){
				// show a new web, the fly was caught					
				var dynamicWeb = new shoot_web.Web(updatedFlyInstance.positionX, updatedFlyInstance.positionY, updatedFlyInstance, this.webCount);
				this.webs.push(dynamicWeb);
				
				// add to number of catches this round
				// (Not currently used, but could be shown in the UI)
				this.roundCatchCount += 1;
								
				// remove fly
				this.removeChild(updatedFlyInstance);
				
				// add web
				this.appendChild(dynamicWeb);
				
				// increment web count
				this.webCount += 1;					
			}
		}
		
		// iterate all webs and expire them if they've lived for too long
		for(w = 0; w < this.webCount; w++){					
			var iteratedWeb = this.webs[w];
			
			// check for any webs not yet expired
			if(iteratedWeb.isExpired == false){
				if((new Date().getTime() - iteratedWeb.deployedTime) >= 3000){
					iteratedWeb.expireWeb(this);
					
					// increment count of expired webs
					this.expiredWebCount += 1;
				}
			}
		}
		
		// if all webs are expired then we need to end the round
		if((this.webCount > 0) && this.expiredWebCount == this.webCount){
						
			// immediately stop the parent function 'updateGameFrame' from being called by the timer, because the round is over
			lime.scheduleManager.unschedule(this.updateGameFrame, this);
			
			// round is now over
			if((this.webCount - 1) < this.targetCatches){
				// player lost so set level count back to 1
				this.level = 1;
				
				// set best score in cookie if bigger than previous best
				if(runningScore > this.bestScore){
					this.setBestScore(runningScore);
				}

				// submit score to scoreboard API
				scoreboard.SubmitScore(runningScore, shoot_web.DeviceGUID, 'StickyBalls');
				
				// show game over dialog
				var gameOverDialog = shoot_web.dialogs.box4(runningScore);								
				this.cover.appendChild(gameOverDialog);
				shoot_web.dialogs.appear(gameOverDialog);
								
				// 4 sceond timer
				lime.scheduleManager.callAfter(function(){
					
					// restart the game which will kick the player back to the main menu
					location.reload();
									
				}, this, 4000);
			}
			else{				
				// increment game to next level up
				this.level += 1;				
				
				// update the player's score
				this.updateScore();				
				
				// start the next round				
				shoot_web.loadGame(this.level);				
			}			
			
		}
		
	}
};

// update the player's score
shoot_web.Game.prototype.updateScore = function(){
	// each captured fly is worth 50pts, and catching all flies is worth an extra 25pts	
	var potentialNumberCatches = this.flies.length;
	var actualNumberCatches = 0;	
	
	for(i = 0; i < potentialNumberCatches; i++){
		
		if(this.flies[i].isCaught){
			actualNumberCatches += 1;
		}
	}
	
	// add 50pts for each one caught
	this.score += (actualNumberCatches * 50);
	
	// if player has caught all available flies then add an extra 25pts
	if(potentialNumberCatches == actualNumberCatches){
		this.score += 25;
	}
	
	runningScore += this.score;
	
}

// add main web click event
shoot_web.Game.prototype.addMainWeb = function(e) {		
	if(this.webCount < this.maxWebs){
		
		// place a sticky web			
		var playerPositionWeb = new shoot_web.Web(e.position.x, e.position.y, null).setPosition(e.position.x, e.position.y).setAnchorPoint(0,0);			
					
		// offset the position of the web so that the centre of the web appears at the clicked position
		playerPositionWeb.setPosition(playerPositionWeb.position_.x - (playerPositionWeb.size_.width/2), playerPositionWeb.position_.y + (playerPositionWeb.size_.height/2));
		
		this.webs.push(playerPositionWeb);
		this.appendChild(playerPositionWeb);
		
		// increment web count
		this.webCount += 1;
	}
};

shoot_web.Game.prototype.addModalMessage = function(doAddCloseHandler, message, title, message2, message3){
		
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
	
	// add popup and background
	this.appendChild(modalPopup);
	this.appendChild(modalBackground);
	
	// do we want to add a tap handler to allow user to close the modal?
	if(doAddCloseHandler){
		// add event listener to capture any click on the modal background
		goog.events.listen(modalBackground, ['touchstart', 'mousedown'], function(e, gameScene) {
			e.event.stopPropagation();		
					
			// remove popup and background
			this.removeChild(modalPopup);
			this.removeChild(modalBackground);
		});
	}
}

// quick function to determine if a number passed in is odd or even
isOdd = function(num){ 
	return num % 2;
}
 
