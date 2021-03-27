'use strict'

/**
 * @param {import('../types').Options} config
 */
module.exports = config => ({
  ls: require('./ls')(config),
  peers: require('./peers')(config),
  publish: require('./publish')(config),
  subscribe: require('./subscribe')(config),
  unsubscribe: require('./unsubscribe')(config)
})
