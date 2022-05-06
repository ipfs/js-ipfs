import type { IPFS } from 'ipfs-core-types'
import type { Multiaddr } from '@multiformats/multiaddr'

declare module '@hapi/hapi' {
  interface ServerInfo {
    ma: Multiaddr
  }
}

export interface Context {
  ipfs: IPFS
  print: Print
  isDaemon: boolean
  getStdin: () => AsyncIterable<Buffer>
  repoPath: string
}

export interface Print {
  (msg: string | Uint8Array, includeNewline?: boolean, isError?: boolean): void
  clearLine: () => void
  cursorTo: (pos: number) => void
  write: (data: any) => void
  error: (msg: string, includeNewline?: boolean) => void
  isTTY: boolean
  columns: any
}
