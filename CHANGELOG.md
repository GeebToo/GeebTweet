# Changelog

# 1.1.3 (unreleased)
- chore: adding travis ci
- style: replace eslint by standardJS

# 1.1.2 (2016/11/29)
- fix(readTweet): displays only the tweets smaller than the screen size (LCD display)
- fix(utils): simplify regex to split tweet
- style: adding eslintrc and editorconfig
- test(common): add unit tests
- fix(GetTweet): filter the tweets to push to RabbitmMQ
- fix(GetTweet): remove the URL link from tweets

## 1.1.1
 - [HOTFIX] Fix bugs in get_tweet_worker.js

## 1.1.0
- [FEAT] Now it's possible to add argements when launching get_tweet_worker.js to choose the tweets to collect.
- [FIX] Little bugs
- [REFACTO] Create RabbitMQ mapper
- [REFACTO] Create Looger object
- [FEAT] Added web page with socket.io to display tweets. To run this : node app.js

## 1.0.0
- Added a worker which get the tweets in queue of RabbitMQ and displays (in LCD or console)
- Added a worker to crawl the Twitter API and store the tweets formatted in RabbitMQ
