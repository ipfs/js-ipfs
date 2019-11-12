'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  get: callbackify.variadic(require('./get')(config)),
  put: callbackify.variadic(require('./put')(config)),
  resolve: callbackify.variadic(require('./resolve')(config))
})
