'use strict'

const Node = require('libp2p-ipfs-nodejs')
const promisify = require('promisify-es6')

module.exports = function libp2p (self) {
  return {
    start: promisify((callback) => {
      self.config.get(gotConfig)

      function gotConfig (err, config) {
        if (err) {
          return callback(err)
        }

        const options = {
          mdns: config.Discovery.MDNS.Enabled,
          webRTCStar: config.Discovery.webRTCStar.Enabled,
          bootstrap: config.Bootstrap
        }

        self._libp2pNode = new Node(self._peerInfo, undefined, options)

        self._libp2pNode.start((err) => {
          if (err) {
            return callback(err)
          }

          self._libp2pNode.peerInfo.multiaddrs.forEach((ma) => {
            console.log('Swarm listening on', ma.toString())
          })

          self._libp2pNode.discovery.on('peer', (peerInfo) => {
            self._libp2pNode.peerBook.put(peerInfo)
            self._libp2pNode.dialByPeerInfo(peerInfo, () => {})
          })
          self._libp2pNode.swarm.on('peer-mux-established', (peerInfo) => {
            self._libp2pNode.peerBook.put(peerInfo)
          })

          callback()
        })
      }
    }),
    stop: promisify((callback) => {
      self._libp2pNode.stop(callback)
    })
  }
}
