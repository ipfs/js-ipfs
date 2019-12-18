'use strict'

const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const Multiplex = require('pull-mplex')
const SECIO = require('libp2p-secio')
const Bootstrap = require('libp2p-bootstrap')
const KadDHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')

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
      peerDiscovery: [
        wrtcstar.discovery,
        wsstar.discovery,
        Bootstrap
      ],
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
        enabled: false
      },
      pubsub: {
        enabled: true,
        emitSelf: true
      }
    }
  }
}
