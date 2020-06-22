'use strict'

module.exports = config => ({
  getAll: require('./getAll')(config),
  get: require('./get')(config),
  set: require('./set')(config),
  replace: require('./replace')(config),
  profiles: require('./profiles')(config)
})
