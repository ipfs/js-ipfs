'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  add: callbackify.variadic(require('./add')(config)),
  rm: callbackify.variadic(require('./rm')(config)),
  list: callbackify.variadic(require('./list')(config))
})
