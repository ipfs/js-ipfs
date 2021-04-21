'use strict'

/**
 * @param {import('../types').Options} config
 */
module.exports = config => ({
  net: require('./net')(config),
  sys: require('./sys')(config),
  cmds: require('./cmds')(config)
})
