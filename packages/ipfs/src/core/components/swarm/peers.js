'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ libp2p }) => {
  return withTimeoutOption(async function peers (options) { // eslint-disable-line require-await
    options = options || {}

    const verbose = options.v || options.verbose
    const peers = []

    for (const [peerId, connections] of libp2p.connections) {
      for (const connection of connections) {
        const tupple = {
          addr: connection.remoteAddr,
          peer: peerId
        }

        if (verbose || options.direction) {
          tupple.direction = connection.stat.direction
        }

        if (verbose) {
          tupple.muxer = connection.stat.multiplexer
          tupple.latency = 'n/a'
        }

        peers.push(tupple)
      }
    }

    return peers
  })
}
