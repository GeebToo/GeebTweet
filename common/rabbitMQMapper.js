var amqp = require('amqplib/callback_api');
var config = require('./../config.json');
var rabbitHost = config.rabbitmq_host;
var queue = config.rabbitmq_queue;
var queueOptions = {
    durable: true
};

var self = module.exports = {
	closeOnErr : function(err, amqpConn) {
	    if (!err) {
	        return false;
	    }

	    logger.error('[AMQP] error', err);
	    amqpConn.close();
	    return true;
	},
	// if the connection is closed or fails to be established at all, we will reconnect
	init : function(logger, callback) {
		logger.info("blabla");
		amqp.connect(rabbitHost + '?heartbeat=60', function(err, amqpConn) {

	        if (err) {
	            logger.error('[AMQP]', err.message);
	            return setTimeout(function() {
	            	self.init(logger, callback)
	            }, 1000);
	        }

	        amqpConn.on('error', function(err) {
	            if (err.message !== 'Connection closing') {
	                logger.error('[AMQP] conn error', err.message);
	            }
	        });
	        amqpConn.on('close', function() {
	            logger.error('[AMQP] reconnecting');
	            return setTimeout(
	            	function() {
	            		self.init(logger, callback)
	            	}, 1000);
	        });

	        logger.info('[AMQP] connected');
	        self.startWorker(amqpConn, logger, callback);
	    });
	},
	// A worker that acks messages only if processed succesfully
	startWorker : function(amqpConn, logger, callback) {
		amqpConn.createChannel(function(err, ch) {

	        if (self.closeOnErr(err, amqpConn)) {
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

	            if (self.closeOnErr(err, amqpConn)) {
	                return;
	            }

	            ch.consume(queue, processMsg, {
	                noAck: false
	            });
	            logger.info('Worker is started');
	        });

	        function processMsg(msg) {
                callback(msg, function(ok) {
                    try {
                        if (ok) {
                            ch.ack(msg);
                        } else {
                            ch.reject(msg, true);
                        }
                    } catch (e) {
                        self.closeOnErr(e, amqpConn);
                    }
                });
	        }
	    });
	}
}