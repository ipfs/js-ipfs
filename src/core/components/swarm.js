'use strict'

const multiaddr = require('multiaddr')
const promisify = require('promisify-es6')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function swarm (self) {
  return {
    peers: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      const peers = self._libp2pNode.peerBook.getAll()
      const mas = []
      Object
         .keys(peers)
         .forEach((b58Id) => {
           peers[b58Id].multiaddrs.forEach((ma) => {
             // TODO this should only print the addr we are using
             mas.push(ma)
           })
         })

      callback(null, mas)
    }),
    // all the addrs we know
    addrs: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }
      const peers = self._libp2pNode.peerBook.getAll()
      const mas = []
      Object
         .keys(peers)
         .forEach((b58Id) => {
           peers[b58Id].multiaddrs.forEach((ma) => {
             // TODO this should only print the addr we are using
             mas.push(ma)
           })
         })

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
