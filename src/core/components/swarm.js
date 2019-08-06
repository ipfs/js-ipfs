'use strict'

const promisify = require('promisify-es6')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function swarm (self) {
  return {
    peers: promisify((opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }

      opts = opts || {}

      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
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

      callback(null, peers)
    }),

    // all the addrs we know
    addrs: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
      }

      const peers = Object.values(self._peerInfoBook.getAll())

      callback(null, peers)
    }),

    localAddrs: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
      }

      callback(null, self.libp2p.peerInfo.multiaddrs.toArray())
    }),

    connect: promisify((maddr, callback) => {
      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
      }

      self.libp2p.dial(maddr, callback)
    }),

    disconnect: promisify((maddr, callback) => {
      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
      }

      self.libp2p.hangUp(maddr, callback)
    }),

    filters: promisify((callback) => callback(new Error('Not implemented')))
  }
}
