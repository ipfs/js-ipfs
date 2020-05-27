/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable import/no-default-export */
declare module 'libp2p-tcp' {
  import Multiaddr from 'multiaddr'
  import {Connection, Transport, TransportListener, LibP2PHandler, DialOptions} from 'ipfs-interface'

  export default class TCP implements Transport {
    dial(ma: Multiaddr, options?: DialOptions): Connection
    createListener(options: any, handler?: LibP2PHandler): TransportListener
    filter(multiaddrs: Multiaddr[]): Multiaddr[]
  }
}
