'use strict'

/**
 * @param {import('../types').Options} config
 */
module.exports = config => ({
  tail: require('./tail')(config),
  ls: require('./ls')(config),
  level: require('./level')(config)
})
