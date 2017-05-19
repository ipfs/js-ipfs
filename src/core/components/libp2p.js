'use strict'

const Node = require('libp2p-ipfs-nodejs')
const promisify = require('promisify-es6')
const get = require('lodash.get')

module.exports = function libp2p (self) {
  return {
    start: promisify((callback) => {
      self.config.get(gotConfig)

      function gotConfig (err, config) {
        if (err) {
          return callback(err)
        }

        const options = {
          mdns: get(config, 'Discovery.MDNS.Enabled'),
          webRTCStar: get(config, 'Discovery.webRTCStar.Enabled'),
          bootstrap: get(config, 'Bootstrap'),
          dht: self._options.EXPERIMENTAL.dht
        }

        self._libp2pNode = new Node(self._peerInfo, self._peerInfoBook, options)

        self._libp2pNode.on('peer:discovery', (peerInfo) => {
          if (self.isOnline()) {
            self._peerInfoBook.put(peerInfo)
            self._libp2pNode.dial(peerInfo, () => {})
          }
        })

        self._libp2pNode.on('peer:connect', (peerInfo) => {
          self._peerInfoBook.put(peerInfo)
        })

        self._libp2pNode.start((err) => {
          if (err) {
            return callback(err)
          }

          self._libp2pNode.peerInfo.multiaddrs.forEach((ma) => {
            console.log('Swarm listening on', ma.toString())
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
