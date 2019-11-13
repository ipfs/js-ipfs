'use strict'

const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const Bootstrap = require('libp2p-bootstrap')
const KadDHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')
const Multiplex = require('pull-mplex')
const SECIO = require('libp2p-secio')

module.exports = ({ peerInfo, options }) => {
  return {
    switch: {
      denyTTL: 2 * 60 * 1e3, // 2 minute base
      denyAttempts: 5, // back off 5 times
      maxParallelDials: 150,
      maxColdCalls: 50,
      dialTimeout: 10e3 // Be strict with dial time
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
        SECIO
      ],
      peerDiscovery: [
        MulticastDNS,
        Bootstrap
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
        }
      },
      dht: {
        kBucketSize: 20,
        enabled: false,
        randomWalk: {
          enabled: false
        }
      },
      pubsub: {
        enabled: true,
        emitSelf: true
      }
    }
  }
}
