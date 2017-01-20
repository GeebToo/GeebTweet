/* global it, describe */

var assert = require('assert')
var Utils = require('../common/utils.js')

describe('Utils', function () {
  describe('function removeUrl', function () {
    var testsCases = []
    testsCases['The graphic designer’s (http://make.your.com ) first fucking'] = 'The graphic designer’s ( ) first fucking'
    testsCases['If you are not being fucking honest'] = 'If you are not being fucking honest'
    testsCases['https://google.com Why are you fucking'] = ' Why are you fucking'
    testsCases['Intuition is fucking important https://github.com/GeebToo'] = 'Intuition is fucking important '
    testsCases['https://github.com/GeebToo If you fucking give http://github.com'] = ' If you fucking give '

    it('should return the text without url link', function () {
      for (var test in testsCases) {
        if (testsCases.hasOwnProperty(test)) {
          assert.equal(testsCases[test], Utils.removeUrl(test))
        }
      }
    })
  })

  describe('function accentsTidy', function () {
    var testsCases = []
    testsCases['énervé'] = 'enerve'
    testsCases['être'] = 'etre'
    testsCases['À bientôt'] = 'A bientot'
    testsCases['Ça déchire'] = 'Ca dechire'

    it('should return the text without the accents', function () {
      for (var test in testsCases) {
        if (testsCases.hasOwnProperty(test)) {
          assert.equal(testsCases[test], Utils.accentsTidy(test))
        }
      }
    })
  })
})
