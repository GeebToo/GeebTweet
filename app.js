var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var amqp = require('amqplib/callback_api');
var Logger = require('./common/logger.js');
var config = require('./config.json');

var logger = Logger.createLogger()

var rabbitHost = config.rabbitmq_host;
var queue = config.rabbitmq_queue;
var queueOptions = {
    durable: true
};
var timeByTweet = config.timeByTweet;
server.listen(3000);

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/views/index.html');
});

var collectionSockets = [];
io.on('connection', function (socket) {
	collectionSockets.push(socket);

	socket.on('disconnect', function () {
		var i = collectionSockets.indexOf(socket);
        collectionSockets.splice(i, 1);
	});
});


// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null;

function init() {
    amqp.connect(rabbitHost + '?heartbeat=60', function(err, conn) {

        if (err) {
            logger.error('[AMQP]', err.message);
            return setTimeout(init, 1000);
        }

        conn.on('error', function(err) {
            if (err.message !== 'Connection closing') {
                logger.error('[AMQP] conn error', err.message);
            }
        });
        conn.on('close', function() {
            logger.error('[AMQP] reconnecting');
            return setTimeout(init, 1000);
        });

        logger.info('[AMQP] connected');
        amqpConn = conn;
        startWorker();
    });
}

// A worker that acks messages only if processed succesfully
function startWorker() {
    amqpConn.createChannel(function(err, ch) {

        if (closeOnErr(err)) {
            return;
        }

        ch.on('error', function(err) {
            logger.error('[AMQP] channel error', err.message);
        });
        ch.on('close', function() {
            logger.info('[AMQP] channel closed');
        });

        ch.prefetch(1);
        ch.assertQueue(queue, queueOptions, function(err, _ok) {

            if (closeOnErr(err)) {
                return;
            }

            ch.consume(queue, processMsg, {
                noAck: false
            });
            logger.info('Worker is started');
        });

        function processMsg(msg) {
                displayTweet(msg, function(ok) {
                    try {
                        if (ok) {
                            ch.ack(msg);
                        } else {
                            ch.reject(msg, true);
                        }
                    } catch (e) {
                        closeOnErr(e);
                    }
                });
            
        }
    });
}

function displayTweet(msg, cb) {
    var tweet = msg.content.toString();
    var tweetWasDisplayed = false;
    for (var i = 0; i < collectionSockets.length; i++) {
		collectionSockets[i].emit('new tweet', tweet);
        tweetWasDisplayed = true
    }
    setTimeout(function(){
        cb(tweetWasDisplayed);
    }, timeByTweet);
}

function closeOnErr(err) {
    if (!err) {
        return false;
    }

    logger.error('[AMQP] error', err);
    amqpConn.close();
    return true;
}

init();