'use strict'

const sinon = require('sinon')

function matchIterable () {
  return sinon.match((thing) => Boolean(thing[Symbol.asyncIterator]) || Boolean(thing[Symbol.iterator]))
}

module.exports = matchIterable
