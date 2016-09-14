'use strict'

const multiaddr = require('multiaddr')
const promisify = require('promisify-es6')
const flatMap = require('lodash.flatmap')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function swarm (self) {
  return {
    peers: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      const mas = collectAddrs(self._libp2pNode.peerBook)
      callback(null, mas)
    }),
    // all the addrs we know
    addrs: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      const mas = collectAddrs(self._libp2pNode.peerBook)
      callback(null, mas)
    }),
    localAddrs: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      callback(null, self._libp2pNode.peerInfo.multiaddrs)
    }),
    connect: promisify((maddr, callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      if (typeof maddr === 'string') {
        maddr = multiaddr(maddr)
      }

      self._libp2pNode.dialByMultiaddr(maddr, callback)
    }),
    disconnect: promisify((maddr, callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      if (typeof maddr === 'string') {
        maddr = multiaddr(maddr)
      }

      self._libp2pNode.hangUpByMultiaddr(maddr, callback)
    }),
    filters: promisify((callback) => {
      // TODO
      throw new Error('Not implemented')
    })
  }
}

function collectAddrs (book) {
  const peers = book.getAll()
  return flatMap(Object.keys(peers), (id) => {
    return peers[id].multiaddrs
  })
}
