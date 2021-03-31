import { IPFS } from 'ipfs-core-types'
import { Request, Server } from '@hapi/hapi'
import Multiaddr from 'multiaddrs'

declare module '@hapi/hapi' {
  interface ServerApplicationState {
    ipfs: IPFS
  }
  interface ServerInfo {
    ma: Multiaddr
  }
}

export { Request, Server }
