import TCP from 'libp2p-tcp'
// @ts-expect-error - no types
import MulticastDNS from 'libp2p-mdns'
// @ts-expect-error - no types
import WS from 'libp2p-websockets'
import KadDHT from 'libp2p-kad-dht'
import GossipSub from 'libp2p-gossipsub'
// @ts-expect-error - no types
import Multiplex from 'libp2p-mplex'
import { NOISE } from '@chainsafe/libp2p-noise'
import { validator, selector } from './utils/ipns.js'
import os from 'os'

export function libp2pConfig () {
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
        enabled: true,
        clientMode: true,
        validators: {
          ipns: validator
        },
        selectors: {
          ipns: selector
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
