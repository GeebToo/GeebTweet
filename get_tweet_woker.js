var Twitter = require('twitter');
var Logger = require('./common/logger.js');
var _ = require('lodash/string');
var RabbitMQMapper = require('./common/rabbitMQMapper.js');
var config = require('./config.json');

var logger = Logger.createLogger();
var client = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret,
});
var sentence = "JE VEUX";
var tweetId = 0;
var regex = new RegExp(regexStr);
RabbitMQMapper.initPublisher(logger);

setInterval(function() {
    client.get(
        'search/tweets', {
            q: encodeURI('"' + sentence.toLowerCase() + '"') + ' -RT',
            lang: 'fr',
            locale: 'fr',
            count: 100,
            result_type: 'recent',
            since_id: tweetId
        },
        function(error, tweets, response) {

            for (var i = 0; i < tweets.statuses.length; i++) {
                if (tweets.statuses[i].id > tweetId) {
                    var tweet = tweets.statuses[i].text;
                    var tweetSplit = tweet.split(regex);

                    if (tweetSplit[1] !== undefined) {
                        RabbitMQMapper.publish('', RabbitMQMapper.queue, new Buffer(sentence + tweetSplit[1]));
                        logger.debug(sentence + tweetSplit[1]);
                    } else {
                        RabbitMQMapper.publish('', RabbitMQMapper.queue, new Buffer(sentence + tweetSplit[0]));
                        logger.debug(sentence + tweetSplit[0]);
                    }
                } else {
                    logger.debug('[TWEETER] same tweet : ' + tweets.statuses[i].text);
                    logger.info(tweets.statuses.length + ' i = ' + i);
                }

                if (i == tweets.statuses.length - 1) {
                    tweetId = tweets.search_metadata.max_id;
                }
            };
        });
}, 60000);

function createRegex(sentence) {
    var regexStr = '';

    for (var i = 0; i < sentence.length; i++) {
        if (sentence[i].toLowerCase() === _.lowerCase(sentence[i])) {
            regexStr += '['
                + sentence[i].toLowerCase()
                + sentence[i].toUpperCase()
                + ']';
        } else {
            regexStr += '['
                + sentence[i].toLowerCase()
                + sentence[i].toUpperCase()
                + _.lowerCase(sentence[i])
                + _.upperCase(sentence[i])
                + ']'; 
        }
    }

    return regexStr;
}
