'use strict'

/**
 * @param {import('../../types').Options} config
 */
module.exports = config => ({
  apply: require('./apply')(config),
  list: require('./list')(config)
})
