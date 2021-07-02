'use strict'

/**
 * @param {import('../types').Options} config
 */
module.exports = config => ({
  export: require('./export')(config),
  get: require('./get')(config),
  import: require('./import')(config),
  put: require('./put')(config),
  resolve: require('./resolve')(config),
  tree: require('./tree')(config)
})
