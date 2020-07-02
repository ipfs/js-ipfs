'use strict'

const { isValidMultiaddr } = require('./utils')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ repo }) => {
  return withTimeoutOption(async function add (multiaddr, options = {}) {
    if (!isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    const config = await repo.config.getAll(options)

    if (config.Bootstrap.indexOf(multiaddr) === -1) {
      config.Bootstrap.push(multiaddr)
    }

    await repo.config.set(config)

    return {
      Peers: [multiaddr]
    }
  })
}
