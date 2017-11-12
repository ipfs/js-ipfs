'use strict'

// libp2p-nodejs gets replaced by libp2p-browser when webpacked/browserified
const Node = require('../runtime/libp2p-nodejs')
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
          modules: self._libp2pModules,
          // EXPERIMENTAL
          dht: get(self._options, 'EXPERIMENTAL.dht', false),
          relay: {
            enabled: get(config, 'EXPERIMENTAL.relay.enabled', false),
            hop: {
              enabled: get(config, 'EXPERIMENTAL.relay.hop.enabled', false),
              active: get(config, 'EXPERIMENTAL.relay.hop.active', false)
            }
          }
        }

        self._libp2pNode = new Node(self._peerInfo, self._peerInfoBook, options)

        self._libp2pNode.on('peer:discovery', (peerInfo) => {
          const dial = () => {
            self._peerInfoBook.put(peerInfo)
            self._libp2pNode.dial(peerInfo, () => {})
          }
          if (self.isOnline()) {
            dial()
          } else {
            self._libp2pNode.once('start', dial)
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
