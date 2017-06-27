'use strict'

const getConfig = require('./default-config')
const requestAPI = require('./request-api')
const multiaddr = require('multiaddr')

module.exports = (arg) => {
  const config = getConfig()

  if (typeof arg === 'function') {
    return arg
  } else if (typeof arg === 'object') {
    return requestAPI(arg)
  } else if (typeof arg === 'string') {
    const maddr = multiaddr(arg).nodeAddress()
    config.host = maddr.address
    config.port = maddr.port
    return requestAPI(config)
  } else {
    throw new Error('Argument must be a send function or a config object.')
  }
}
