'use strict'

/**
 * @param {import('../types').Options} config
 */
module.exports = config => ({
  gen: require('./gen')(config),
  list: require('./list')(config),
  rename: require('./rename')(config),
  rm: require('./rm')(config),
  import: require('./import')(config),
  export: require('./export')(config),
  info: require('./info')(config)
})
