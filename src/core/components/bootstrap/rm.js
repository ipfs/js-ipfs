'use strict'

const isMultiaddr = require('mafmt').IPFS.matches

function isValidMultiaddr (ma) {
  try {
    return isMultiaddr(ma)
  } catch (err) {
    return false
  }
}

module.exports = ({ repo }) => {
  return async function rm (multiaddr, options) {
    options = options || {}

    if (multiaddr && !isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    let res = []
    const config = await repo.config.get()

    if (options.all) {
      res = config.Bootstrap || []
      config.Bootstrap = []
    } else {
      config.Bootstrap = (config.Bootstrap || []).filter(ma => ma !== multiaddr)
    }

    await repo.config.set(config)

    if (!options.all && multiaddr) {
      res.push(multiaddr)
    }

    return { Peers: res }
  }
}
