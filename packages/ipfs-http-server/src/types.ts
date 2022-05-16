import type { IPFS } from 'ipfs-core-types'
import type { Request, Server } from '@hapi/hapi'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { Mtime } from 'ipfs-unixfs'

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

export type { Request, Server }

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
