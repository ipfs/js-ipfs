

declare module 'libp2p-webrtc-star' {
  import { EventEmitter } from 'events'
  import Multiaddr from 'multiaddr'
  import {Connection, Transport, TransportListener, LibP2PHandler, DialOptions} from 'ipfs-interface'

  

  class WebRTCStar implements Transport {
    constructor(options?: any)
    dial(ma: Multiaddr, options?: DialOptions): Promise<Connection>
    createListener(options?: any, handler?: LibP2PHandler): TransportListener
    filter(multiaddrs: Multiaddr[]): Multiaddr[]
    discovery: EventEmitter
  }

  // eslint-disable-next-line import/no-default-export
  export default WebRTCStar
}
