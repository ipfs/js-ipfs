'use strict'

const multiaddr = require('multiaddr')

const loadCommands = require('./load-commands')
const getConfig = require('./config')
const getRequestAPI = require('./request-api')

exports = module.exports = IpfsAPI

function IpfsAPI (host_or_multiaddr, port, opts) {
  const config = getConfig()

  try {
    const maddr = multiaddr(host_or_multiaddr).nodeAddress()
    config.host = maddr.address
    config.port = maddr.port
  } catch (e) {
    if (typeof host_or_multiaddr === 'string') {
      config.host = host_or_multiaddr
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
