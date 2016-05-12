# GeebTweet

Display on a little LCD (4*20) all tweets which contains `Je veux`

![GeebTweet]()

## Dependencies

* NodeJs 4.x.x (if you want to display tweet on your Raspberry pi with a I2C LCD)


## Installation

Create a `config.json``

```bash
npm install

# if you want to display tweet on your Raspberry pi with a I2C LCD
npm install lcdi2c
```


## Run

```bash
# to run the crawler to the Twitter API and store the tweets formatted in RabbitMQ
node get_tweet_worker.js

# to run the worker which get the tweets in queue of RabbitMQ and displays (in LCD or console)
node read_tweet_worker.js
```
