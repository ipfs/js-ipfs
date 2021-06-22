'use strict'

/**
 * @param {import('../types').Options} config
 */
module.exports = config => ({
  get: require('./get')(config),
  put: require('./put')(config),
  resolve: require('./resolve')(config),
  tree: require('./tree')(config)
})
