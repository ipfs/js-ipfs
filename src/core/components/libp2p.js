'use strict'

const Libp2pNode = require('libp2p-ipfs').Node
const promisify = require('promisify-es6')

module.exports = function libp2p (self) {
  // TODO Just expose libp2p API directly, this start stop wrapping doesn't make that much sense anymore :)
  return {
    start: promisify((callback) => {
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
    }),
    stop: promisify((callback) => {
      self._libp2pNode.stop(callback)
    })
  }
}
