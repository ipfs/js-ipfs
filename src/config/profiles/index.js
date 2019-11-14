'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  apply: callbackify.variadic(require('./apply')(config)),
  list: callbackify.variadic(require('./list')(config))
})
