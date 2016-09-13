'use strict'

const multiaddr = require('multiaddr')
const Libp2pNode = require('libp2p-ipfs').Node
const promisify = require('promisify-es6')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function libp2p (self) {
  // NOTE: TODO CONSIDER/CONSIDERING putting all of libp2p (start, stop, peerbook and so on) inside the libp2p object and reduce one layer

  return {
    start: (callback) => {
      self._libp2pNode = new Libp2pNode(self._peerInfo)
      self._libp2pNode.start(() => {
        // TODO connect to bootstrap nodes, it will get us more addrs
        self._libp2pNode.peerInfo.multiaddrs.forEach((ma) => {
          console.log('Swarm listening on', ma.toString())
        })
        callback()
      })

      self._libp2pNode.discovery.on('peer', (peerInfo) => {
        self._libp2pNode.peerBook.put(peerInfo)
        self._libp2pNode.dialByPeerInfo(peerInfo, () => {})
      })
      self._libp2pNode.swarm.on('peer-mux-established', (peerInfo) => {
        self._libp2pNode.peerBook.put(peerInfo)
      })
    },
    stop: (callback) => {
      self._libp2pNode.stop(callback)
    },
    swarm: {
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
    },
    routing: {},
    records: {},
    ping: () => {
      throw new Error('Not implemented')
    }
  }
}
