'use strict'

const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const Multiplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const KadDHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')
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
        WS,
        WebRTCStar
      ],
      streamMuxer: [
        Multiplex
      ],
      connEncryption: [
        SECIO
      ],
      peerDiscovery: [],
      dht: KadDHT,
      pubsub: GossipSub
    },
    config: {
      peerDiscovery: {
        autoDial: true,
        bootstrap: {
          enabled: true
        },
        webRTCStar: {
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
    }
  }
}
