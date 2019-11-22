'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  tail: require('./tail')(config),
  ls: callbackify.variadic(require('./ls')(config)),
  level: callbackify.variadic(require('./level')(config))
})
