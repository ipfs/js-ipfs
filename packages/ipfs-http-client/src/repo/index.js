'use strict'

/**
 * @param {import('../types').Options} config
 */
module.exports = config => ({
  gc: require('./gc')(config),
  stat: require('./stat')(config),
  version: require('./version')(config)
})
