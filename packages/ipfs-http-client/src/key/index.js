'use strict'

module.exports = config => ({
  gen: require('./gen')(config),
  list: require('./list')(config),
  rename: require('./rename')(config),
  rm: require('./rm')(config),
  export: require('./export')(config),
  import: require('./import')(config)
})
