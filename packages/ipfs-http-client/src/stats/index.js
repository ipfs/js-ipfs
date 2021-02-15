'use strict'

/**
 * @param {import('../types').Options} config
 */
module.exports = config => ({
  bitswap: require('../bitswap/stat')(config),
  bw: require('./bw')(config),
  repo: require('../repo/stat')(config)
})
