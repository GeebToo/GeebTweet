var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var tweets = [
	'JE VEUX passer sur la GeebTweet !', 
	'JE VEUX faire un gros dodo...', 
	'JE VEUX te voir dans un film ...'
];
server.listen(3000);

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	var refreshTweet = setInterval(function(){
		console.log('connected !')
		socket.emit('new tweet', tweets[Math.floor((Math.random() * 3))]);
	}, 2000);

	socket.on('disconnect', function () {
		console.log('disconnect !');
		clearInterval(refreshTweet);
	});
});