'use strict'

const multiaddr = require('multiaddr')
const Libp2pNode = require('libp2p-ipfs').Node
const promisify = require('promisify-es6')
const flatMap = require('lodash.flatmap')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function libp2p (self) {
  // NOTE: TODO CONSIDER/CONSIDERING putting all of libp2p (start, stop, peerbook and so on) inside the libp2p object and reduce one layer

  return {
    start: (callback) => {
      const node = self._libp2pNode = new Libp2pNode(self._peerInfo)
      node.start((err) => {
        if (err) {
          return callback(err)
        }

        // TODO: connect to bootstrap nodes, it will
        // get us more addrs
        node.peerInfo.multiaddrs.forEach((ma) => {
          console.log('Swarm listening on', ma.toString())
        })
        callback()
      })

      node.discovery.on('peer', (peerInfo) => {
        node.peerBook.put(peerInfo)
        node.dialByPeerInfo(peerInfo, () => {})
      })

      node.swarm.on('peer-mux-established', (peerInfo) => {
        node.peerBook.put(peerInfo)
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
    },
    routing: {},
    records: {},
    ping: () => {
      throw new Error('Not implemented')
    }
  }
}

function collectAddrs (book) {
  const peers = book.getAll()
  return flatMap(Object.keys(peers), (id) => {
    return peers[id].multiaddrs
  })
}
