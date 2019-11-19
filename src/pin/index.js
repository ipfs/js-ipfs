'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  add: callbackify.variadic(require('./add')(config)),
  rm: callbackify.variadic(require('./rm')(config)),
  ls: callbackify.variadic(require('./ls')(config))
})
