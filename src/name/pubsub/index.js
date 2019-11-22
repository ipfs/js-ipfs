'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  cancel: callbackify.variadic(require('./cancel')(config)),
  state: callbackify.variadic(require('./state')(config)),
  subs: callbackify.variadic(require('./subs')(config))
})
