'use strict'

module.exports = config => ({
  publish: require('./publish')(config),
  resolve: require('./resolve')(config),
  pubsub: require('./pubsub')(config)
})
