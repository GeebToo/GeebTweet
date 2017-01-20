# GeebTweet
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Display on a little LCD (4*20) or web page all tweets which contains a specific sentence.
By example it's possible to display all tweets which contains `Je veux`

![GeebTweet](https://raw.githubusercontent.com/GeebToo/GeebTweet/master/screenshots/geebtweet.jpg)

![GeebTweetWebPage](https://raw.githubusercontent.com/GeebToo/GeebTweet/develop/screenshots/geebtweetweb.jpg)

## Dependencies

* NodeJs 4.x.x (if you want to display tweet on your Raspberry pi with a I2C LCD)


## Installation

Create a `config.json`

```bash
npm install

# if you want to display tweet on your Raspberry pi with a I2C LCD
npm install lcdi2c
```


## Run

```bash
# to run the crawler to the Twitter API and store the tweets formatted in RabbitMQ.
# Specify the sentence you want and the worker will collect only the tweets that contain that sentence
node get_tweet_worker.js "<sentence>" <country code>

# to run the worker which get the tweets in queue of RabbitMQ and displays (in LCD or console)
node read_tweet_worker.js

# to run the web server which get the tweets in queue of RabbitMQ and displays in web page with socket.io
node app.js
# then go to http://server_address:3000
```
