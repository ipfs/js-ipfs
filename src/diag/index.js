'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  net: callbackify.variadic(require('./net')(config)),
  sys: callbackify.variadic(require('./sys')(config)),
  cmds: callbackify.variadic(require('./cmds')(config))
})
