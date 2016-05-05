'use strict'

const peerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const Libp2pNode = require('libp2p-ipfs').Node

module.exports = function libp2p (self) {
  const OFFLINE_ERROR = new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')

  return {
    start: (callback) => {
      self._libp2pNode = new Libp2pNode(self._peerInfo)
      self._libp2pNode.start(() => {
        // TODO connect to bootstrap nodes, it will get us more addrs
        self._peerInfo.multiaddrs.forEach((ma) => {
          console.log('Swarm listening on', ma.toString())
        })
        callback()
      })
    },
    stop: (callback) => {
      self._libp2pNode.swarm.close(callback)
    },
    swarm: {
      peers: (callback) => {
        if (!self._libp2pNode) {
          return callback(OFFLINE_ERROR)
        }

        callback(null, self._peerInfoBook.getAll())
      },
      // all the addrs we know
      addrs: (callback) => {
        if (!self._libp2pNode) {
          return callback(OFFLINE_ERROR)
        }
        // TODO
        throw new Error('Not implemented')
      },
      localAddrs: (callback) => {
        if (!self._libp2pNode) {
          return callback(OFFLINE_ERROR)
        }

        callback(null, self._peerInfo.multiaddrs)
      },
      connect: (ma, callback) => {
        if (!self._libp2pNode) {
          return callback(OFFLINE_ERROR)
        }

        const idStr = ma.toString().match(/\/ipfs\/(.*)/)
        if (!idStr) {
          return callback(new Error('invalid multiaddr'))
        }
        const id = peerId.createFromB58String(idStr[1])
        const peer = new PeerInfo(id)

        ma = ma.toString().replace(/\/ipfs\/(.*)/, '') // FIXME remove this when multiaddr supports ipfs

        peer.multiaddr.add(multiaddr(ma))
        self._peerInfoBook.put(peer)

        self._libp2pNode.swarm.dial(peer, (err) => {
          callback(err, id)
        })
      },
      disconnect: (callback) => {
        if (!self._libp2pNode) {
          return callback(OFFLINE_ERROR)
        }

        throw new Error('Not implemented')
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
