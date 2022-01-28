
// @ts-expect-error - no types
import WS from 'libp2p-websockets'
// @ts-expect-error - no types
import WebRTCStar from 'libp2p-webrtc-star'
// @ts-expect-error - no types
import Multiplex from 'libp2p-mplex'
import { NOISE } from '@chainsafe/libp2p-noise'
import KadDHT from 'libp2p-kad-dht'
import GossipSub from 'libp2p-gossipsub'
import { validator, selector } from './utils/ipns.js'

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
        WS,
        WebRTCStar
      ],
      streamMuxer: [
        Multiplex
      ],
      connEncryption: [
        NOISE
      ],
      peerDiscovery: [],
      dht: KadDHT,
      pubsub: GossipSub
    },
    config: {
      peerDiscovery: {
        autoDial: true,
        // [Bootstrap.tag] = 'bootstrap'
        bootstrap: {
          enabled: true
        },
        // [WebRTCStar.discovery.tag]
        webRTCStar: {
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
        enabled: false
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
