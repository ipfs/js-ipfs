'use strict'

/**
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {import('../types').Options} config
 */
module.exports = (codecs, config) => ({
  get: require('./get')(codecs, config),
  put: require('./put')(codecs, config),
  resolve: require('./resolve')(config)
})
