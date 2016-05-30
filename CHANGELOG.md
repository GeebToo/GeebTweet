# Changelog

## 1.1.0
- [FEAT] Now it's possible to add argements when launching get_tweet_worker.js to choose the tweets to collect.
- [FIX] Little bugs
- [REFACTO] Create RabbitMQ mapper
- [REFACTO] Create Looger object
- [FEAT] Added web page with socket.io to display tweets. To run this : node app.js

## 1.0.0
- Added a worker which get the tweets in queue of RabbitMQ and displays (in LCD or console)
- Added a worker to crawl the Twitter API and store the tweets formatted in RabbitMQ