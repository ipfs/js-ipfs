import { webRTCStar } from '@libp2p/webrtc-star'

export function libp2pConfig () {
  const webRtcStar = webRTCStar()

  /** @type {import('libp2p').Libp2pOptions} */
  const options = {
    transports: [
      webRtcStar.transport
    ],
    peerDiscovery: [
      webRtcStar.discovery
    ],
    connectionManager: {
      maxParallelDials: 150, // 150 total parallel multiaddr dials
      maxDialsPerPeer: 4, // Allow 4 multiaddrs to be dialed per peer in parallel
      dialTimeout: 10e3, // 10 second dial timeout per peer dial
      autoDial: true
    },
    nat: {
      enabled: false
    }
  }

  return options
}
