'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    peers: require('./peers')(send),
    connect: require('./connect')(send),
    disconnect: require('./disconnect')(send),
    addrs: require('./addrs')(send),
    localAddrs: require('./localAddrs')(send)
  }
}
