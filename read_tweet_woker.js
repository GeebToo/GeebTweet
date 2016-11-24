var Logger = require('./common/logger.js');
var RabbitMQMapper = require('./common/rabbitMQMapper.js');
var Utils = require('./common/utils.js');
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
    logger.info(tweet);
    logger.info();
  }

  setTimeout(function() {
    cb(true);
  }, timeByTweet);
}

function formatTweetForLCD(tweet, lineLength) {
  var word = '';
  var lineTmp = '';
  var lcdTweet = [];

  for (var i = 0; i < tweet.length; i++) {
    if (tweet[i] == ' ') {
      if ((lineTmp.length + word.length) <= lineLength) {
        lineTmp += Utils.accentsTidy(word) + ' ';
      } else {
        lcdTweet.push(lineTmp);
        lineTmp = Utils.accentsTidy(word) + ' ';
      }
      word = '';
    } else {
      word += tweet[i];
    }
  }

    // Last word
  if ((lineTmp.length + word.length) <= lineLength) {
    lineTmp += Utils.accentsTidy(word);
    lcdTweet.push(lineTmp);
  } else {
    lcdTweet.push(lineTmp);
    lcdTweet.push(Utils.accentsTidy(word));
  }

  return lcdTweet;
}
