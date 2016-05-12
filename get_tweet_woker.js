var amqp = require('amqplib/callback_api');
var Twitter = require('twitter');
var config = require('./config.json');

var client = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret,
});
var rabbitHost = config.rabbitmq_host;

var phrase = "JE VEUX";

var tweetId = 0;
var queue = config.rabbitmq_queue;
var queueOptions = {
    durable: true
};

// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null;
var pubChannel = null;
var offlinePubQueue = [];

function init() {
    amqp.connect(rabbitHost + '?heartbeat=60', function(err, conn) {

        if (err) {
            console.error('[AMQP]', err.message);
            return setTimeout(start, 1000);
        }

        conn.on('error', function(err) {
            if (err.message !== 'Connection closing') {
                console.error('[AMQP] conn error', err.message);
            }
        });
        conn.on('close', function() {
            console.error('[AMQP] reconnecting');
            return setTimeout(start, 1000);
        });

        console.log('[AMQP] connected');
        amqpConn = conn;
        whenConnected();
    });
}



function whenConnected() {
    startPublisher();
}



function startPublisher() {
    amqpConn.createConfirmChannel(function(err, ch) {

        if (closeOnErr(err)) return;

        ch.on('error', function(err) {
            console.error('[AMQP] channel error', err.message);
        });

        ch.on('close', function() {
            console.log('[AMQP] channel closed');
        });

        //Read old messages if the worker lost connection
        pubChannel = ch;
        while (true) {
            var m = offlinePubQueue.shift();

            if (!m) {
                break;
            }

            publish(m[0], m[1], m[2]);
        }
    });
}



function publish(exchange, routingKey, content) {
    try {
        pubChannel.publish(exchange, routingKey, content, {
            persistent: true
        }, function(err, ok) {
            if (err) {
                console.error('[AMQP] publish', err);
                offlinePubQueue.push([exchange, routingKey, content]);
                pubChannel.connection.close();
            }
        });
    } catch (e) {
        console.error('[AMQP] publish', e.message);
        offlinePubQueue.push([exchange, routingKey, content]);
    }
}

function closeOnErr(err) {
    if (!err) {
        return false;
    }

    console.error('[AMQP] error', err);
    amqpConn.close();
    return true;
}


setInterval(function() {
    client.get(
        'search/tweets', {
            q: '%22je%20veux%22 -RT',
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
                    var regex = new RegExp("je veux|Je veux|Je Veux|JE VEUX|Je VEUX|je VEUX");
                    var tweetSplit = tweet.split(regex);

                    if (tweetSplit[1] !== undefined) {
                        publish('', queue, new Buffer(phrase + tweetSplit[1]));
                    } else {
                        publish('', queue, new Buffer(phrase + tweetSplit[0]));
                    }
                } else {
                    console.log('[TWEETER] same tweet : ' + tweets.statuses[i].text);
                    console.log(tweets.statuses.length + ' i = ' + i);
                }

                if (i == tweets.statuses.length - 1) {
                    tweetId = tweets.search_metadata.max_id;
                }
            };
        });
}, 60000);

init();