var amqp = require('amqplib/callback_api');
var config = require('./../config.json');
var rabbitHost = config.rabbitmq_host;
var queue = config.rabbitmq_queue;
var queueOptions = {durable: true};

var pubChannel = 'null';
var offlinePubQueue = [];

var self = module.exports = {
  pubChannel: pubChannel,

  offlinePubQueue: offlinePubQueue,

  queue: queue,
  // ################################################################
  // Create connection to RabbitMQ and run the worker that read message
  // if the connection is closed or fails to be established at all, we will reconnect
  // ################################################################
  initConsumer: function(logger, callback) {
    amqp.connect(rabbitHost + '?heartbeat=60', (err, amqpConn) => {

      if (err) {
        logger.error('[AMQP]', err.message);
        return setTimeout(() => {
          self.initConsumer(logger, callback);
        }, 1000);
      }

      amqpConn.on('error', (err) => {
        if (err.message !== 'Connection closing') {
          logger.error('[AMQP] conn error', err.message);
        }
      });
      amqpConn.on('close', () => {
        logger.error('[AMQP] reconnecting');
        return setTimeout(
          () => {
            self.initConsumer(logger, callback);
          }, 1000);
      });

      logger.info('[AMQP] connected');
      self.startConsumer(amqpConn, logger, callback);
    });
  },
  // ################################################################
  // A worker that acks messages only if processed succesfully
  // ################################################################
  startConsumer: function(amqpConn, logger, callback) {
    amqpConn.createChannel((err, ch) => {

      if (self.closeOnErr(err, amqpConn)) {
        logger.error('[AMQP] error', err);
        return;
      }

      ch.on('error', (err) => {
        logger.error('[AMQP] channel error', err.message);
      });
      ch.on('close', () => {
        logger.info('[AMQP] channel closed');
      });

      ch.prefetch(1);
      ch.assertQueue(queue, queueOptions, (err, _ok) => {

        if (self.closeOnErr(err, amqpConn)) {
          logger.error('[AMQP] error', err);
          return;
        }

        ch.consume(queue, processMsg, {noAck: false});
        logger.info('Worker is started');
      });

      function processMsg(msg) {
        callback(msg, (ok) => {
          try {
            if (ok) {
              ch.ack(msg);
            } else {
              ch.reject(msg, true);
            }
          } catch (e) {
            self.closeOnErr(e, amqpConn);
            logger.error('[AMQP] error', err);
          }
        });
      }
    });
  },
  // ################################################################
  // Create connection to RabbitMQ and run the worker that publish message
  // if the connection is closed or fails to be established at all, we will reconnect
  // ################################################################
  initPublisher: function(logger) {
    amqp.connect(rabbitHost + '?heartbeat=60', (err, amqpConn) => {

      if (err) {
        logger.error('[AMQP]', err.message);
        return setTimeout(() => {
          self.initPublisher(logger);
        }, 1000);
      }

      amqpConn.on('error', (err) => {
        if (err.message !== 'Connection closing') {
          logger.error('[AMQP] conn error', err.message);
        }
      });
      amqpConn.on('close', () => {
        logger.error('[AMQP] reconnecting');
        return setTimeout(
          () => {
            self.initPublisher(logger);
          }, 1000);
      });

      logger.info('[AMQP] connected');
      self.startPublisher(amqpConn, logger);
    });
  },
  // ################################################################
  // A worker that publish message
  // ################################################################
  startPublisher: function(amqpConn, logger) {
    amqpConn.createConfirmChannel((err, ch) => {

      if (self.closeOnErr(err, amqpConn)) {
        logger.error('[AMQP] error', err);
        return;
      }

      ch.on('error', (err) => {
        logger.error('[AMQP] channel error', err.message);
      });

      ch.on('close', () => {
        logger.info('[AMQP] channel closed');
      });

          // Read old messages if the worker lost connection
      self.pubChannel = ch;
      while (true) {
        var m = self.offlinePubQueue.shift();

        if (!m) {
          break;
        }

        self.publish(m[0], m[1], m[2], logger);
      }
    });
  },
  // ################################################################
  // function to publish message and if connection fail, store message in variable to save it
  // ################################################################
  publish: function(exchange, routingKey, content, logger) {
    try {
      self.pubChannel.publish(exchange, routingKey, content, {persistent: true}, (err, ok) => {
        if (err) {
          logger.error('[AMQP] publish', err);
          self.offlinePubQueue.push([exchange, routingKey, content]);
          self.pubChannel.connection.close();
        }
      });
    } catch (e) {
      logger.error('[AMQP] publish', e.message);
      self.offlinePubQueue.push([exchange, routingKey, content]);
    }
  },

  closeOnErr: function(err, amqpConn) {
    if (!err) {
      return false;
    }

    amqpConn.close();
    return true;
  }
};
