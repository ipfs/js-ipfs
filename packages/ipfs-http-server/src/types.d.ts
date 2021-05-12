import { IPFS } from 'ipfs-core-types'
import { Request, Server } from '@hapi/hapi'
import Multiaddr from 'multiaddrs'
import { Mtime } from 'ipfs-unixfs'
import IPLD from 'ipld'
import libp2p from 'libp2p'

declare module '@hapi/hapi' {
  interface ServerApplicationState {
    ipfs: IPFS
  }
  interface RequestApplicationState {
    signal: AbortSignal
  }
  interface ServerInfo {
    ma: Multiaddr
  }
}

export { Request, Server }

interface MultipartUpload {
  name: string
  mtime?: Mtime
  mode?: number
}

export interface MultipartFile extends MultipartUpload {
  type: 'file'
  content: AsyncIterable<Uint8Array>
}

export interface MultipartDirectory extends MultipartUpload {
  type: 'directory'
}

export interface MultipartSymlink extends MultipartUpload {
  type: 'symlink'
  target: string
}

export type MultipartEntry = MultipartFile | MultipartDirectory | MultipartSymlink
