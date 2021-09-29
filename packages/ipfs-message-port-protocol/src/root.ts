import type { Mtime } from 'ipfs-unixfs'
import type { RemoteIterable } from './core'
import type { EncodedCID } from './cid'

export type FileType = 'dir' | 'file'

export type EncodedFileContent = ArrayBufferView | ArrayBuffer | Blob | string | RemoteIterable<ArrayBufferView> | RemoteIterable<ArrayBuffer>

export interface EncodedFileInput {
  path?: string
  content: EncodedFileContent
  mode?: number
  mtime?: Mtime
}

export interface EncodedDirectoryInput {
  path: string
  mode?: number
  mtime?: Mtime
}

export type EncodedAddInput = EncodedFileContent | EncodedFileInput | EncodedDirectoryInput
export type EncodedAddAllInput = RemoteIterable<EncodedAddInput>

export interface EncodedAddResult {
  path: string
  cid: EncodedCID
  size: number
  mode?: number
  mtime?: Mtime
}

export interface EncodedIPFSEntry {
  cid: EncodedCID
  type: FileType
  name: string
  path: string
  depth: number
  size: number
  mode?: number
  mtime?: Mtime
}
