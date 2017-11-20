'use strict'

const getConfig = require('./default-config')
const sendRequest = require('./send-request')
const multiaddr = require('multiaddr')

module.exports = (arg) => {
  const config = getConfig()

  if (typeof arg === 'function') {
    return arg
  } else if (typeof arg === 'object') {
    return sendRequest(arg)
  } else if (typeof arg === 'string') {
    const maddr = multiaddr(arg).nodeAddress()
    config.host = maddr.address
    config.port = maddr.port
    return sendRequest(config)
  } else {
    throw new Error('Argument must be a send function or a config object.')
  }
}
