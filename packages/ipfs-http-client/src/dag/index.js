'use strict'

module.exports = config => ({
  get: require('./get')(config),
  put: require('./put')(config),
  resolve: require('./resolve')(config)
})
