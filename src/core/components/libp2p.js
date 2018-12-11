'use strict'

const promisify = require('promisify-es6')
const get = require('lodash/get')
const defaultsDeep = require('@nodeutils/defaults-deep')
const ipnsUtils = require('../ipns/routing/utils')

module.exports = function libp2p (self) {
  return {
    start: promisify((callback) => {
      self.config.get(gotConfig)

      function gotConfig (err, config) {
        if (err) {
          return callback(err)
        }

        const defaultBundle = (opts) => {
          const libp2pDefaults = {
            datastore: opts.datastore,
            peerInfo: opts.peerInfo,
            peerBook: opts.peerBook,
            config: {
              peerDiscovery: {
                mdns: {
                  enabled: get(opts.options, 'config.Discovery.MDNS.Enabled',
                    get(opts.config, 'Discovery.MDNS.Enabled', true))
                },
                webRTCStar: {
                  enabled: get(opts.options, 'config.Discovery.webRTCStar.Enabled',
                    get(opts.config, 'Discovery.webRTCStar.Enabled', true))
                },
                bootstrap: {
                  list: get(opts.options, 'config.Bootstrap',
                    get(opts.config, 'Bootstrap', []))
                }
              },
              relay: {
                enabled: get(opts.options, 'relay.enabled',
                  get(opts.config, 'relay.enabled', false)),
                hop: {
                  enabled: get(opts.options, 'relay.hop.enabled',
                    get(opts.config, 'relay.hop.enabled', false)),
                  active: get(opts.options, 'relay.hop.active',
                    get(opts.config, 'relay.hop.active', false))
                }
              },
              dht: {
                kBucketSize: get(opts.options, 'dht.kBucketSize', 20),
                enabledDiscovery: get(opts.options, 'dht.enabledDiscovery', true),
                validators: {
                  ipns: ipnsUtils.validator
                },
                selectors: {
                  ipns: ipnsUtils.selector
                }
              },
              EXPERIMENTAL: {
                dht: !(get(opts.options, 'local', false)),
                pubsub: get(opts.options, 'EXPERIMENTAL.pubsub', false)
              }
            },
            connectionManager: get(opts.options, 'connectionManager',
              get(opts.config, 'connectionManager', {}))
          }

          const libp2pOptions = defaultsDeep(
            get(self._options, 'libp2p', {}),
            libp2pDefaults
          )

          // Required inline to reduce startup time
          // Note: libp2p-nodejs gets replaced by libp2p-browser when webpacked/browserified
          const Node = require('../runtime/libp2p-nodejs')
          return new Node(libp2pOptions)
        }

        // Always create libp2p via a bundle function
        let libp2pBundle = get(self._options, 'libp2p', null)
        if (typeof libp2pBundle !== 'function') {
          libp2pBundle = defaultBundle
        }

        self._libp2pNode = libp2pBundle({
          options: self._options,
          config: config,
          datastore: self._repo.datastore,
          peerInfo: self._peerInfo,
          peerBook: self._peerInfoBook
        })

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
            self._print('Swarm listening on', ma.toString())
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
