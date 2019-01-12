'use strict'

const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const WebSocketStar = require('libp2p-websocket-star')
const Bootstrap = require('libp2p-bootstrap')
const KadDHT = require('libp2p-kad-dht')
const Multiplex = require('libp2p-mplex')
const Stardust = require('libp2p-stardust')
const SECIO = require('libp2p-secio')
const libp2p = require('libp2p')
const defaultsDeep = require('@nodeutils/defaults-deep')

class Node extends libp2p {
  constructor (_options) {
    const wsstar = new WebSocketStar({ id: _options.peerInfo.id })

    let stardust

    if (_options.config.EXPERIMENTAL.stardust) {
      stardust = new Stardust({ id: _options.peerInfo.id, softFail: true })
    }

    const defaults = {
      modules: {
        transport: [
          TCP,
          WS,
          stardust || wsstar
        ],
        streamMuxer: [
          Multiplex
        ],
        connEncryption: [
          SECIO
        ],
        peerDiscovery: [
          MulticastDNS,
          Bootstrap,
          stardust ? stardust.discovery : wsstar.discovery
        ],
        dht: KadDHT
      },
      config: {
        peerDiscovery: {
          mdns: {
            enabled: true
          },
          stardust: {
            enabled: true
          },
          bootstrap: {
            enabled: true
          },
          websocketStar: {
            enabled: true
          }
        },
        dht: {
          kBucketSize: 20
        },
        EXPERIMENTAL: {
          dht: false,
          pubsub: false
        }
      }
    }

    delete _options.config.EXPERIMENTAL.stardust

    super(defaultsDeep(_options, defaults))
  }
}

module.exports = Node
