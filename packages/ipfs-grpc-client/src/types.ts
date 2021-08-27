import type { Agent as HttpAgent } from 'http'
import type { Agent as HttpsAgent } from 'https'
import type { Multiaddr } from 'multiaddr'

export interface Options {
  url: string | URL | Multiaddr
  agent?: HttpAgent | HttpsAgent
}

export interface RPCOptions<Metadata> {
  host: string | URL | Multiaddr
  debug?: boolean
  metadata: Metadata
  agent?: HttpAgent | HttpsAgent
}
