var amqp = require('amqplib/callback_api');
var Twitter = require('twitter');
var config = require('./config.json');
var moment = require('moment');

var client = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret,
});
var rabbitHost = config.rabbitmq_host;

var queue = config.rabbitmq_queue;
var queueOptions = {
    durable: true
};
var timeByTweet = config.timeByTweet;
var displayOnLCD = config.displayOnLCD; // if true run : "npm install lcdi2c" !!
var lcdLineLenght = config.lcdLineLenght;
var lcdNbreOfLine = config.lcdNbreOfLine;

// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null;

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
            console.error('[AMQP] channel error', err.message);
        });
        ch.on('close', function() {
            console.log('[AMQP] channel closed');
        });

        ch.prefetch(1);
        ch.assertQueue(queue, queueOptions, function(err, _ok) {

            if (closeOnErr(err)) {
                return;
            }

            ch.consume(queue, processMsg, {
                noAck: false
            });
            console.log('Worker is started');
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

    if (displayOnLCD) {
        var LCD = require('lcdi2c');
        var lcd = new LCD( 1, 0x27, 20, 4 );
        var lcdTweet = formatTweetForLCD(tweet, lcdLineLenght);
        lcd.clear();
        for (var j = 0; j < lcdTweet.length && j < lcdNbreOfLine; j++) {
            lcd.println(lcdTweet[j], j+1);
        }
    } else {
        console.log(tweet);
        console.log();
    }

    setTimeout(function(){
        cb(true);
    }, timeByTweet);
}



function closeOnErr(err) {
    if (!err) {
        return false;
    }

    console.error('[AMQP] error', err);
    amqpConn.close();
    return true;
}

function formatTweetForLCD (tweet, lineLength) {
    var word = '';
    var lineTmp = '';
    var lcdTweet = [];

    for (var i = 0; i < tweet.length; i++) {
        if (tweet[i] == ' ') {
            if ((lineTmp.length + word.length) <= lineLength) {
                lineTmp += accentsTidy(word) + ' ';
            } else {
                lcdTweet.push(lineTmp);
                lineTmp = accentsTidy(word) + ' ';
            }
            word = '';
        } else {
            word += tweet[i];
        }
    }

    // Last word
    if ((lineTmp.length + word.length) <= lineLength) {
        lineTmp += accentsTidy(word);
        lcdTweet.push(lineTmp);
    } else {
        lcdTweet.push(lineTmp);
        lcdTweet.push(accentsTidy(word));
    }

    return lcdTweet;
}

function accentsTidy(s){
    var r = s;
    r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
    r = r.replace(new RegExp("[ÀÁÂÃÄÅ]", 'g'),"A");
    r = r.replace(new RegExp("æ", 'g'),"ae");
    r = r.replace(new RegExp("Æ", 'g'),"AE");
    r = r.replace(new RegExp("ç", 'g'),"c");
    r = r.replace(new RegExp("Ç", 'g'),"C");
    r = r.replace(new RegExp("[èéêë]", 'g'),"e");
    r = r.replace(new RegExp("[ÈÉÊË]", 'g'),"E");
    r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
    r = r.replace(new RegExp("[ÌÍÎÏ]", 'g'),"I");
    r = r.replace(new RegExp("ñ", 'g'),"n");
    r = r.replace(new RegExp("Ñ", 'g'),"N");
    r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
    r = r.replace(new RegExp("[ÒÓÔÕÖ]", 'g'),"O");
    r = r.replace(new RegExp("œ", 'g'),"oe");
    r = r.replace(new RegExp("Œ", 'g'),"OE");
    r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
    r = r.replace(new RegExp("[ÙÚÛÜ]", 'g'),"U");
    r = r.replace(new RegExp("[ýÿ]", 'g'),"y");
    r = r.replace(new RegExp("[ÝŸ]", 'g'),"Y");
    return r;
};

init();