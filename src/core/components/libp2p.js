'use strict'

const Libp2pNode = require('libp2p-ipfs').Node
const promisify = require('promisify-es6')
const Bootstrap = require('libp2p-railing')
// const parallel = require('run-parallel')

module.exports = function libp2p (self) {
  // TODO Just expose libp2p API directly, this start stop wrapping doesn't make that much sense anymore :)
  return {
    start: promisify((callback) => {
      self._libp2pNode = new Libp2pNode(self._peerInfo)
      self._libp2pNode.start(() => {
        self._repo.config.get((err, config) => {
          // parallel(
          //   config.Bootstrap.map((addr) => (cb) => self._libp2pNode.dialByMultiaddr(addr, cb)),
          //   (err, res) => { if (res) console.log('Bootstrapped', res.length, 'peers') }
          // )
          self._bootstrap = new Bootstrap(config.Bootstrap, {verify: true}, self._libp2pNode.swarm)
        })
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
        self._libp2pNode.peerBook.put(peerInfo, true)
      })
    }),
    stop: promisify((callback) => {
      self._libp2pNode.stop(callback)
    })
  }
}
