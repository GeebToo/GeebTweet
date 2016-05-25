var Logger = require('./common/logger.js');
var RabbitMQMapper = require('./common/rabbitMQMapper.js');
var config = require('./config.json');

var logger = Logger.createLogger();
var timeByTweet = config.timeByTweet;
var displayOnLCD = config.displayOnLCD; // if true run : "npm install lcdi2c" !!
var lcdLineLenght = config.lcdLineLenght;
var lcdNbreOfLine = config.lcdNbreOfLine;

if (displayOnLCD) {
    var LCD = require('lcdi2c');
    var lcd = new LCD( 1, 0x27, 20, 4 );
}
RabbitMQMapper.initConsumer(logger, displayTweet);

function displayTweet(msg, cb) {
    var tweet = msg.content.toString();

    if (displayOnLCD) {
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
