import type { IPFS } from 'ipfs-core-types'
import type { Request, Server } from '@hapi/hapi'
import type { Multiaddr } from '@multiformats/multiaddr'

declare module '@hapi/hapi' {
  interface ServerApplicationState {
    ipfs: IPFS
  }
  interface ServerInfo {
    ma: Multiaddr
  }
}

export type { Request, Server }
