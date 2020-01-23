'use strict'

const defaultConfig = require('../../runtime/config-nodejs.js')
const { isValidMultiaddr } = require('./utils')

module.exports = ({ repo }) => {
  return async function add (multiaddr, options) {
    options = options || {}

    if (multiaddr && !isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    const config = await repo.config.get()
    if (options.default) {
      config.Bootstrap = defaultConfig().Bootstrap
    } else if (multiaddr && config.Bootstrap.indexOf(multiaddr) === -1) {
      config.Bootstrap.push(multiaddr)
    }
    await repo.config.set(config)

    return {
      Peers: options.default ? defaultConfig().Bootstrap : [multiaddr]
    }
  }
}
