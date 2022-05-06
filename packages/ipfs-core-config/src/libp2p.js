import { TCP } from '@libp2p/tcp'
import { MulticastDNS } from '@libp2p/mdns'
import os from 'os'

export function libp2pConfig () {
  /** @type {import('libp2p').Libp2pOptions} */
  const options = {
    transports: [
      new TCP()
    ],
    peerDiscovery: [
      new MulticastDNS()
    ],
    connectionManager: {
      maxParallelDials: 150, // 150 total parallel multiaddr dials
      maxDialsPerPeer: 4, // Allow 4 multiaddrs to be dialed per peer in parallel
      dialTimeout: 10e3, // 10 second dial timeout per peer dial
      autoDial: true
    },
    nat: {
      enabled: true,
      description: `ipfs@${os.hostname()}`
    },
    metrics: {
      enabled: true
    }
  }

  return options
}
