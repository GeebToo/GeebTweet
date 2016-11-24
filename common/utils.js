var _ = require('lodash/string');

module.exports = {
  createRegex : function(sentence) {
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
  },
  removeUrl : function(s) {
    var r = s;
    r = r.replace(new RegExp('(?:https?|ftp):\/\/[\\S]+', 'g'),'');
    return r;
  },
  accentsTidy : function(s) {
    var r = s;
    r = r.replace(new RegExp('[àáâãäå]', 'g'),'a');
    r = r.replace(new RegExp('[ÀÁÂÃÄÅ]', 'g'),'A');
    r = r.replace(new RegExp('æ', 'g'),'ae');
    r = r.replace(new RegExp('Æ', 'g'),'AE');
    r = r.replace(new RegExp('ç', 'g'),'c');
    r = r.replace(new RegExp('Ç', 'g'),'C');
    r = r.replace(new RegExp('[èéêë]', 'g'),'e');
    r = r.replace(new RegExp('[ÈÉÊË]', 'g'),'E');
    r = r.replace(new RegExp('[ìíîï]', 'g'),'i');
    r = r.replace(new RegExp('[ÌÍÎÏ]', 'g'),'I');
    r = r.replace(new RegExp('ñ', 'g'),'n');
    r = r.replace(new RegExp('Ñ', 'g'),'N');
    r = r.replace(new RegExp('[òóôõö]', 'g'),'o');
    r = r.replace(new RegExp('[ÒÓÔÕÖ]', 'g'),'O');
    r = r.replace(new RegExp('œ', 'g'),'oe');
    r = r.replace(new RegExp('Œ', 'g'),'OE');
    r = r.replace(new RegExp('[ùúûü]', 'g'),'u');
    r = r.replace(new RegExp('[ÙÚÛÜ]', 'g'),'U');
    r = r.replace(new RegExp('[ýÿ]', 'g'),'y');
    r = r.replace(new RegExp('[ÝŸ]', 'g'),'Y');
    return r;
  }
};