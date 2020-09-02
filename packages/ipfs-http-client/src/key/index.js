'use strict'

module.exports = config => ({
  gen: require('./gen')(config),
  list: require('./list')(config),
  rename: require('./rename')(config),
  rm: require('./rm')(config),
  import: require('./import')(config)
})
