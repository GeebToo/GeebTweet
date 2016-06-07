var Twitter = require('twitter');
var Logger = require('./common/logger.js');
var Utils = require('./common/utils.js');
var RabbitMQMapper = require('./common/rabbitMQMapper.js');
var config = require('./config.json');

var logger = Logger.createLogger();
var client = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret,
});

if (process.argv.length != 4) {
    logger.error('Error, missing arguments...');
    logger.error('To run this program, specify the sentence to use and the country code.');
    logger.error('Like that : node get_tweet_worker.js "<sentence>" <country code>');
    logger.error('The order of arguments is important');
    logger.error('---------- Example ----------');
    logger.error('node get_tweet_worker.js "Je veux" fr');
    process.exit(1);
}

var sentence = process.argv[2];
var locale = process.argv[3];
var tweetId = 0;
var regex = new RegExp(Utils.createRegex(sentence));

RabbitMQMapper.initPublisher(logger);

setInterval(function() {
    client.get(
        'search/tweets', {
            q: encodeURI('"' + sentence.toLowerCase() + '"') + ' -RT',
            lang: locale,
            locale: locale,
            count: 100,
            result_type: 'recent',
            since_id: tweetId
        },
        function(error, tweets, response) {
            if (tweets) {
                for (var i = 0; i < tweets.statuses.length; i++) {
                    if (tweets.statuses[i].id > tweetId) {
                        var tweet = tweets.statuses[i].text;
                        var tweetSplit = tweet.split(regex);

                        if (tweetSplit[1] !== undefined) {
                            RabbitMQMapper.publish('', RabbitMQMapper.queue, new Buffer(sentence.toUpperCase() + tweetSplit[1]));
                            logger.debug(sentence.toUpperCase() + tweetSplit[1]);
                        } else {
                            RabbitMQMapper.publish('', RabbitMQMapper.queue, new Buffer(sentence.toUpperCase() + tweetSplit[0]));
                            logger.debug(sentence.toUpperCase() + tweetSplit[0]);
                        }
                    } else {
                        logger.debug('[TWEETER] same tweet : ' + tweets.statuses[i].text);
                        logger.info(tweets.statuses.length + ' i = ' + i);
                    }

                    if (i == tweets.statuses.length - 1) {
                        tweetId = tweets.search_metadata.max_id;
                    }
                }

            } else {
                logger.error('tweet.statuses is undefined : ' + tweets);
            }
        });
}, 60000);
