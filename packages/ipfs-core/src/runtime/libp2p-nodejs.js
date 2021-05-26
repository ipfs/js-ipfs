'use strict'

// @ts-ignore - no types
const TCP = require('libp2p-tcp')
// @ts-ignore - no types
const MulticastDNS = require('libp2p-mdns')
// @ts-ignore - no types
const WS = require('libp2p-websockets')
const KadDHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')
// @ts-ignore - no types
const Multiplex = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const ipnsUtils = require('../ipns/routing/utils')
const os = require('os')

module.exports = () => {
  /** @type {import('libp2p').Libp2pOptions} */
  const options = {
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
        [MulticastDNS.tag]: {
          enabled: true
        },
        // Optimization
        // Requiring bootstrap inline in components/libp2p to reduce the cli execution time
        // [Bootstrap.tag] = 'bootstrap'
        bootstrap: {
          enabled: true
        }
      },
      dht: {
        kBucketSize: 20,
        enabled: false,
        clientMode: true,
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
      },
      nat: {
        enabled: true,
        description: `ipfs@${os.hostname()}`
      }
    },
    metrics: {
      enabled: true
    },
    peerStore: {
      persistence: true
    }
  }

  return options
}
