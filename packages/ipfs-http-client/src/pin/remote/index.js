'use strict'

module.exports = config => ({
  add: require('./add')(config),
  ls: require('./ls')(config),
  rm: require('./rm')(config)
})
