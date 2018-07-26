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

        const defaultGenerator = (_ipfs, _config) => {
          const libp2pDefaults = {
            peerInfo: _ipfs._peerInfo,
            peerBook: _ipfs._peerInfoBook,
            config: {
              peerDiscovery: {
                mdns: {
                  enabled: get(_ipfs._options, 'config.Discovery.MDNS.Enabled',
                    get(_config, 'Discovery.MDNS.Enabled', true))
                },
                webRTCStar: {
                  enabled: get(_ipfs._options, 'config.Discovery.webRTCStar.Enabled',
                    get(_config, 'Discovery.webRTCStar.Enabled', true))
                },
                bootstrap: {
                  list: get(_ipfs._options, 'config.Bootstrap',
                    get(_config, 'Bootstrap', []))
                }
              },
              relay: {
                enabled: get(_ipfs._options, 'relay.enabled',
                  get(_config, 'relay.enabled', false)),
                hop: {
                  enabled: get(_ipfs._options, 'relay.hop.enabled',
                    get(_config, 'relay.hop.enabled', false)),
                  active: get(_ipfs._options, 'relay.hop.active',
                    get(_config, 'relay.hop.active', false))
                }
              },
              EXPERIMENTAL: {
                dht: get(_ipfs._options, 'EXPERIMENTAL.dht', false),
                pubsub: get(_ipfs._options, 'EXPERIMENTAL.pubsub', false)
              }
            },
            connectionManager: get(_ipfs._options, 'connectionManager',
              get(_config, 'connectionManager', {}))
          }

          const libp2pOptions = defaultsDeep(
            get(self._options, 'libp2p', {}),
            libp2pDefaults
          )

          return new Node(libp2pOptions)
        }

        // Always create libp2p via a generator
        let libp2pGenerator = get(self._options, 'libp2p', null)
        if (typeof libp2pGenerator !== 'function') {
          libp2pGenerator = defaultGenerator
        }

        self._libp2pNode = libp2pGenerator(self, config)

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
