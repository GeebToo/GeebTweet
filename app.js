var Twitter = require('twitter');
var config = require('./config.json');
var moment = require('moment');

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret,
});

const I_WANT = "JE VEUX";

var tweetId = 0;

setInterval(function(){
	client.get(
		'search/tweets',
		{q: '%22je%20veux%22', lang: 'fr', locale: 'fr', count: 100, result_type: 'recent', since_id: tweetId},
		function(error, tweets, response){
			console.log(tweets.statuses.length);
			console.log(tweetId);
			tweetId = tweets.search_metadata.max_id;
			// for (var i = 0; i < tweets.statuses.length; i++) {

			// 	if (tweetId < tweets.statuses[i].id) {
			// 		tweetId = tweets.statuses[i].id;
			// 		console.log('tweetID !');
			// 	}
				// var tweet = tweets.statuses[i].text;
				// var tweetSplit = tweet.split("je veux");

				// if (tweetSplit.length === 1) {
				// 	tweetSplit = tweet.split("Je veux");
				// 	if (tweetSplit.length === 1) {
				// 		tweetSplit = tweet.split("JE VEUX");
				// 	}
				// }

				// if (tweetSplit[1] !== undefined) {
		  //  			console.log(I_WANT + tweetSplit[1]);
				// } else {
				// 	console.log(I_WANT + tweetSplit[0]);
				// }
		  //  		console.log('   ');
			// };
	});
}, 60000);