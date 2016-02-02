/* 
* Author:	Julian Willing
* Date:		25/01/2016
* Desc:		Client API handler for ScoreboardAPI
*/

"use strict";

var scoreboard = scoreboard || {};

// gets the top 5 distinct highest score across all stickyballs players from the scoreboard API v2
scoreboard.GetHighScores = function(){
	
	// because this is an asynchronous call we use javascript promise so that the calling function can wait until the function returns a response
	return new Promise(function(resolve, reject) {	
	
		var url = 'http://jwiwebdesign.co.uk/WordWalkScoreboardAPI/API/scores?gameName=stickyballs&numberOfScores=5';		
		var xhr = createCORSRequest('GET', url);
		
		/* Response handlers *********************/
		xhr.onload = function() {
			// read response from server	
			var responseText = xhr.responseText;

			// parse response to object
			var scores = JSON.parse(responseText);

			// returns the 
			resolve(scores);		
		};
		
		xhr.onerror = function() {
			// looks like something went wrong making the request
			//reject(Error(xhr.statusText));
		};
		/* ***************************************/

		// send the request to the scoreboard API v2
		xhr.send();
		
	});
}

// submits a new score to the scoreboard API
scoreboard.SubmitScore = function(playerScore, playerId, gameName){
	var url = 'http://jwiwebdesign.co.uk/WordWalkScoreboardAPI/API/scores?playerScore=' + playerScore + '&playerId=' + playerId + '&gameName=' + gameName;
	
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