'use strict'

/**
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {import('../types').Options} config
 */
module.exports = (codecs, config) => ({
  export: require('./export')(config),
  get: require('./get')(codecs, config),
  import: require('./import')(config),
  put: require('./put')(codecs, config),
  resolve: require('./resolve')(config)
})
