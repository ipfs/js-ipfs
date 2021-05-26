import CID from 'cids';
import type { AbortOptions, PreloadOptions } from '../utils'
import type { DAGNode, DAGNodeLike, DAGLink } from 'ipld-dag-pb'
import type { API as PatchAPI } from './patch'

export interface API<OptionExtension = {}> {
  new: (options?: NewObjectOptions & OptionExtension) => Promise<CID>
  put: (obj: DAGNode | DAGNodeLike | Uint8Array, options?: PutOptions & OptionExtension) => Promise<CID>
  get: (cid: CID, options?: AbortOptions & PreloadOptions & OptionExtension) => Promise<DAGNode>
  data: (cid: CID, options?: AbortOptions & PreloadOptions & OptionExtension) => Promise<Uint8Array>
  links: (cid: CID, options?: AbortOptions & PreloadOptions & OptionExtension) => Promise<DAGLink[]>
  stat: (cid: CID, options?: AbortOptions & PreloadOptions & OptionExtension) => Promise<StatResult>

  patch: PatchAPI
}

export interface NewObjectOptions extends AbortOptions, PreloadOptions {
  template?: 'unixfs-dir'
}

export interface PutOptions extends AbortOptions, PreloadOptions {
  enc?: PutEncoding
}

export interface StatResult {
  Hash: string
  NumLinks: number
  BlockSize: number
  LinksSize: number
  DataSize: number
  CumulativeSize: number
}

export type PutEncoding = 'json' | 'protobuf'