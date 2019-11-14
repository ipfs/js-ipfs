'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  get: callbackify.variadic(require('./get')(config)),
  set: callbackify.variadic(require('./set')(config)),
  replace: callbackify.variadic(require('./replace')(config)),
  profiles: require('./profiles')(config)
})
