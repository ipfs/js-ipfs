'use strict'

const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const Multiplex = require('pull-mplex')
const SECIO = require('libp2p-secio')
const Bootstrap = require('libp2p-bootstrap')
const KadDHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')

module.exports = ({ peerInfo, options }) => {
  const wrtcstar = new WebRTCStar({ id: peerInfo.id })

  return {
    switch: {
      denyTTL: 2 * 60 * 1e3, // 2 minute base
      denyAttempts: 5, // back off 5 times
      maxParallelDials: 100,
      maxColdCalls: 25,
      dialTimeout: 20e3
    },
    modules: {
      transport: [
        WS,
        wrtcstar
      ],
      streamMuxer: [
        Multiplex
      ],
      connEncryption: [
        SECIO
      ],
      peerDiscovery: [
        wrtcstar.discovery,
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
