'use strict'

const callbackify = require('callbackify')
const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function swarm (self) {
  return {
    peers: callbackify.variadic(async (opts) => { // eslint-disable-line require-await
      opts = opts || {}

      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      const verbose = opts.v || opts.verbose
      // TODO: return latency and streams when verbose is set
      // we currently don't have this information

      const peers = []

      Object.values(self._peerInfoBook.getAll()).forEach((peer) => {
        const connectedAddr = peer.isConnected()

        if (!connectedAddr) { return }

        const tupple = {
          addr: connectedAddr,
          peer: peer.id
        }
        if (verbose) {
          tupple.latency = 'n/a'
        }

        peers.push(tupple)
      })

      return peers
    }),

    // all the addrs we know
    addrs: callbackify(async () => { // eslint-disable-line require-await
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      const peers = Object.values(self._peerInfoBook.getAll())

      return peers
    }),

    localAddrs: callbackify(async () => { // eslint-disable-line require-await
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      return self.libp2p.peerInfo.multiaddrs.toArray()
    }),

    connect: callbackify(async (maddr) => { // eslint-disable-line require-await
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      return self.libp2p.dial(maddr)
    }),

    disconnect: callbackify(async (maddr) => { // eslint-disable-line require-await
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      return self.libp2p.hangUp(maddr)
    }),

    filters: callbackify(async () => { // eslint-disable-line require-await
      throw new Error('Not implemented')
    })
  }
}
