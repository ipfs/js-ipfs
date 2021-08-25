'use strict'

/**
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {import('../types').Options} config
 */
module.exports = (codecs, config) => ({
  data: require('./data')(config),
  get: require('./get')(config),
  links: require('./links')(config),
  new: require('./new')(config),
  patch: require('./patch')(config),
  put: require('./put')(codecs, config),
  stat: require('./stat')(config)
})
