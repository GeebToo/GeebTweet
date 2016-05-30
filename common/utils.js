var _ = require('lodash/string');

module.exports = {
    createRegex : function (sentence) {
        var regexStr = '';

        for (var i = 0; i < sentence.length; i++) {
            if (sentence[i].toLowerCase() === _.lowerCase(sentence[i])) {
                regexStr += '['
                    + sentence[i].toLowerCase()
                    + sentence[i].toUpperCase()
                    + ']';
            } else {
                regexStr += '['
                    + sentence[i].toLowerCase()
                    + sentence[i].toUpperCase()
                    + _.lowerCase(sentence[i])
                    + _.upperCase(sentence[i])
                    + ']'; 
            }
        }

        return regexStr;
    }
}