'use strict'

const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const KadDHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')
const Multiplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const { NOISE } = require('libp2p-noise')
const ipnsUtils = require('../ipns/routing/utils')

module.exports = () => {
  return {
    dialer: {
      maxParallelDials: 150, // 150 total parallel multiaddr dials
      maxDialsPerPeer: 4, // Allow 4 multiaddrs to be dialed per peer in parallel
      dialTimeout: 10e3 // 10 second dial timeout per peer dial
    },
    modules: {
      transport: [
        TCP,
        WS
      ],
      streamMuxer: [
        Multiplex
      ],
      connEncryption: [
        SECIO,
        NOISE
      ],
      peerDiscovery: [
        MulticastDNS
      ],
      dht: KadDHT,
      pubsub: GossipSub
    },
    config: {
      peerDiscovery: {
        autoDial: true,
        mdns: {
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
        kBucketSize: 20,
        enabled: false,
        randomWalk: {
          enabled: false
        },
        validators: {
          ipns: ipnsUtils.validator
        },
        selectors: {
          ipns: ipnsUtils.selector
        }
      },
      pubsub: {
        enabled: true,
        emitSelf: true
      }
    },
    metrics: {
      enabled: true
    },
    peerStore: {
      persistence: true
    }
  }
}
