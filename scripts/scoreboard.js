/* 
* Author:	Julian Willing
* Date:		25/01/2016
* Desc:		Client API handler for ScoreboardAPI
*/

"use strict";

var scoreboard = scoreboard || {};

// gets the highest score across all players from the scoreboard API v2
scoreboard.GetHighScore = function(lblWorldHighScore){
	var url = 'http://jwiwebdesign.co.uk/ScoreboardAPI/API/scores?gameName=stickyballs';
	
	var xhr = createCORSRequest('GET', url);
	
	/* Response handlers *********************/
	xhr.onload = function() {
		// read response from server	
		var responseText = xhr.responseText;

		// parse response to object
		var score = JSON.parse(responseText);

		// add global high score to label
		if(score.PlayerScore > 0){
			lblWorldHighScore.setText('Global High Score: ' + score.PlayerScore);
		}		
	};
	
	xhr.onerror = function() {
		// looks like something went wrong making the request
        
	};
	/* ***************************************/

	// send the request to the scoreboard API v2
	xhr.send();
}

// submits a new score to the scoreboard API
scoreboard.SubmitScore = function(playerScore, playerId, gameName){
	var url = 'http://jwiwebdesign.co.uk/ScoreboardAPI/API/scores?playerScore=' + playerScore + '&playerId=' + playerId + '&gameName=' + gameName;
	
	var xhr = createCORSRequest('POST', url);
	
	/* Response handlers *********************/
	xhr.onload = function() {
		// looks like the scoreboard was updated OK		
		if(xhr.status == 201){

		}                			
	};
	
	xhr.onerror = function() {
		// looks like something went wrong making the request
                
	};
	/* ***************************************/

	// send the request to the scoreboard API v2
	xhr.send();

}

// Create the XHR object - required because a CORS is taking place
function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		// XHR for Chrome/Firefox/Opera/Safari.
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		// XDomainRequest for IE.
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		// CORS not supported.
		xhr = null;
	}
	return xhr;
}