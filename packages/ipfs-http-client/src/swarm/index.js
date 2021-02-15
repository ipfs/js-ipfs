'use strict'

/**
 * @param {import('../types').Options} config
 */
module.exports = config => ({
  addrs: require('./addrs')(config),
  connect: require('./connect')(config),
  disconnect: require('./disconnect')(config),
  localAddrs: require('./localAddrs')(config),
  peers: require('./peers')(config)
})
