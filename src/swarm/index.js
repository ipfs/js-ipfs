'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  addrs: callbackify.variadic(require('./addrs')(config)),
  connect: callbackify.variadic(require('./connect')(config)),
  disconnect: callbackify.variadic(require('./disconnect')(config)),
  localAddrs: callbackify.variadic(require('./localAddrs')(config)),
  peers: callbackify.variadic(require('./peers')(config))
})
