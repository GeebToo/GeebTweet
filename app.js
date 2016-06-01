var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Logger = require('./common/logger.js');
var RabbitMQMapper = require('./common/rabbitMQMapper.js');
var config = require('./config.json');

var logger = Logger.createLogger()
var timeByTweet = config.timeByTweet;

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/index.html');
});

var collectionSockets = [];
io.on('connection', function(socket) {
    collectionSockets.push(socket);

    socket.on('disconnect', function() {
        var i = collectionSockets.indexOf(socket);
        collectionSockets.splice(i, 1);
    });
});

RabbitMQMapper.initConsumer(logger, displayTweet);
server.listen(3000);

function displayTweet(msg, cb) {
    var tweet = msg.content.toString();
    var tweetWasDisplayed = false;
    for (var i = 0; i < collectionSockets.length; i++) {
        collectionSockets[i].emit('new tweet', tweet);
        tweetWasDisplayed = true
    }
    setTimeout(function() {
        cb(tweetWasDisplayed);
    }, timeByTweet);
}