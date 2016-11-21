var Logger = require('./common/logger.js');
var logger = Logger.createLogger();
var config = require('./config.json');
var mongoose = require('mongoose');
mongoose.connect(config.mongo.uri);

var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'Mosquit' });
kitty.save(function (err) {
  if (err) {
    logger.error(err);
  } else {
    logger.info('meow');
  }
});