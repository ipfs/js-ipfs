'use strict'

module.exports = config => ({
  add: require('./add')(config),
  rm: require('./rm')(config),
  list: require('./list')(config)
})
