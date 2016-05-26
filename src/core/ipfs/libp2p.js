'use strict'

const peerId = require('peer-id')
const multiaddr = require('multiaddr')
const Libp2pNode = require('libp2p-ipfs').Node
const mafmt = require('mafmt')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function libp2p (self) {
  // NOTE: TODO CONSIDER/ CONSIDERING putting all of libp2p (start, stop, peerbook and so on) inside the libp2p object and reduce one layer

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
      peers: (callback) => {
        if (!self.isOnline()) {
          return callback(OFFLINE_ERROR)
        }

        callback(null, self._libp2pNode.peerBook.getAll())
      },
      // all the addrs we know
      addrs: (callback) => {
        if (!self.isOnline()) {
          return callback(OFFLINE_ERROR)
        }
        // TODO
        throw new Error('Not implemented')
      },
      localAddrs: (callback) => {
        if (!self.isOnline()) {
          return callback(OFFLINE_ERROR)
        }

        callback(null, self._libp2pNode.peerInfo.multiaddrs)
      },
      connect: (maddr, callback) => {
        if (!self.isOnline()) {
          return callback(OFFLINE_ERROR)
        }

        if (typeof maddr === 'string') {
          maddr = multiaddr(maddr)
        }

        if (!mafmt.IPFS.matches(maddr.toString())) {
          return callback(new Error('multiaddr not valid'))
        }

        let ipfsIdB58String
        maddr.stringTuples().forEach((tuple) => {
          if (tuple[0] === 421) {
            ipfsIdB58String = tuple[1]
          }
        })

        const id = peerId.createFromB58String(ipfsIdB58String)

        self._libp2pNode.dialByMultiaddr(maddr, (err) => {
          callback(err, id)
        })
      },
      disconnect: (maddr, callback) => {
        if (!self.isOnline()) {
          return callback(OFFLINE_ERROR)
        }

        if (typeof maddr === 'string') {
          maddr = multiaddr(maddr)
        }

        self._libp2pNode.hangUpByMultiaddr(maddr, callback)
      },
      filters: () => {
        // TODO
        throw new Error('Not implemented')
      }
    },
    routing: {},
    records: {},
    ping: () => {
      throw new Error('Not implemented')
    }
  }
}
