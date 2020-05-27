declare module 'libp2p-websockets' {
  import Multiaddr from 'multiaddr'
  import { Transport, LibP2PHandler, DialOptions} from 'ipfs-interface'

  export type Connection = any
  export type Listener = any

  class WS implements Transport {
    dial(ma: Multiaddr, options: DialOptions): Connection
    createListener(options: any, handler?: LibP2PHandler): Listener
    filter(multiaddrs: Multiaddr[]): Multiaddr[]
  }

  // eslint-disable-next-line import/no-default-export
  export default WS
}
