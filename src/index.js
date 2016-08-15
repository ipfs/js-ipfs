'use strict'

const multiaddr = require('multiaddr')
const loadCommands = require('./load-commands')
const getConfig = require('./default-config')
const getRequestAPI = require('./request-api')

function IpfsAPI (hostOrMultiaddr, port, opts) {
  const config = getConfig()

  try {
    const maddr = multiaddr(hostOrMultiaddr).nodeAddress()
    config.host = maddr.address
    config.port = maddr.port
  } catch (e) {
    if (typeof hostOrMultiaddr === 'string') {
      config.host = hostOrMultiaddr
      config.port = port && typeof port !== 'object' ? port : config.port
    }
  }

  let lastIndex = arguments.length
  while (!opts && lastIndex-- > 0) {
    opts = arguments[lastIndex]
    if (opts) break
  }

  Object.assign(config, opts)

  // autoconfigure in browser
  if (!config.host &&
    typeof window !== 'undefined') {
    const split = window.location.host.split(':')
    config.host = split[0]
    config.port = split[1]
  }

  const requestAPI = getRequestAPI(config)
  const cmds = loadCommands(requestAPI)
  cmds.send = requestAPI
  cmds.Buffer = Buffer

  return cmds
}

exports = module.exports = IpfsAPI
