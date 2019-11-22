'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  publish: callbackify.variadic(require('./publish')(config)),
  resolve: callbackify.variadic(require('./resolve')(config)),
  pubsub: require('./pubsub')(config)
})
