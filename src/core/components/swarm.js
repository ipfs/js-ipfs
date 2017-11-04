'use strict'

const multiaddr = require('multiaddr')
const promisify = require('promisify-es6')
const values = require('lodash.values')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function swarm (self) {
  return {
    peers: promisify((opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }

      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
      }

      const verbose = opts.v || opts.verbose
      // TODO: return latency and streams when verbose is set
      // we currently don't have this information

      const peers = []

      values(self._peerInfoBook.getAll()).forEach((peer) => {
        const connectedAddr = peer.isConnected()

        if (!connectedAddr) { return }

        const tupple = {
          addr: connectedAddr,
          peer: peer
        }
        if (verbose) {
          tupple.latency = 'unknown'
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

      const peers = values(self._peerInfoBook.getAll())

      callback(null, peers)
    }),

    localAddrs: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
      }

      callback(null, self._libp2pNode.peerInfo.multiaddrs.toArray())
    }),

    connect: promisify((maddr, callback) => {
      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
      }

      if (typeof maddr === 'string') {
        maddr = multiaddr(maddr)
      }

      self._libp2pNode.dial(maddr, callback)
    }),

    disconnect: promisify((maddr, callback) => {
      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
      }

      if (typeof maddr === 'string') {
        maddr = multiaddr(maddr)
      }

      self._libp2pNode.hangUp(maddr, callback)
    }),

    filters: promisify((callback) => callback(new Error('Not implemented')))
  }
}
