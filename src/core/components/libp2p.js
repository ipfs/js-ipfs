'use strict'

// libp2p-nodejs gets replaced by libp2p-browser when webpacked/browserified
const Node = require('../runtime/libp2p-nodejs')
const promisify = require('promisify-es6')
const get = require('lodash/get')
const defaultsDeep = require('@nodeutils/defaults-deep')

module.exports = function libp2p (self) {
  return {
    start: promisify((callback) => {
      self.config.get(gotConfig)

      function gotConfig (err, config) {
        if (err) {
          return callback(err)
        }

        const libp2pDefaults = {
          peerInfo: self._peerInfo,
          peerBook: self._peerInfoBook,
          config: {
            peerDiscovery: {
              mdns: {
                enabled: get(self._options, 'config.Discovery.MDNS.Enabled',
                  get(config, 'Discovery.MDNS.Enabled', true))
              },
              webRTCStar: {
                enabled: get(self._options, 'config.Discovery.webRTCStar.Enabled',
                  get(config, 'Discovery.webRTCStar.Enabled', true))
              },
              bootstrap: {
                list: get(self._options, 'config.Bootstrap',
                  get(config, 'Bootstrap', []))
              }
            },
            relay: {
              enabled: get(self._options, 'relay.enabled',
                get(config, 'relay.enabled', false)),
              hop: {
                enabled: get(self._options, 'relay.hop.enabled',
                  get(config, 'relay.hop.enabled', false)),
                active: get(self._options, 'relay.hop.active',
                  get(config, 'relay.hop.active', false))
              }
            },
            EXPERIMENTAL: {
              dht: get(self._options, 'EXPERIMENTAL.dht', false),
              pubsub: get(self._options, 'EXPERIMENTAL.pubsub', false)
            }
          },
          connectionManager: get(self._options, 'connectionManager',
            get(config, 'connectionManager', {}))
        }

        const libp2pOptions = defaultsDeep(
          get(self._options, 'libp2p', {}),
          libp2pDefaults
        )

        self._libp2pNode = new Node(libp2pOptions)

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
          if (err) { return callback(err) }

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
