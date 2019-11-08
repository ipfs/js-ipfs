'use strict'

const callbackify = require('callbackify')

module.exports = (config) => ({
  wantlist: callbackify.variadic(require('./wantlist')(config)),
  stat: callbackify.variadic(require('./stat')(config)),
  unwant: callbackify.variadic(require('./unwant')(config))
})
