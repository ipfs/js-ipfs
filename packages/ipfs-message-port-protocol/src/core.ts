import {
  HashAlg,
  RemoteCallback,
  RemoteIterable,
  Time,
  Mode,
  StringEncoded,
  UnixFSTime,
  FileType
} from './data'
import CID from 'cids'

export interface Core {
  add(input: AddQuery): AddResult
  cat(input: CatQuery): CatResult
  get(input: GetQuery): GetResult
  ls(input: LsQuery): LsResult
}

export type AddQuery = {
  input: AddInput

  chunker?: string
  cidVersion?: number
  enableShardingExperiment?: boolean
  hashAlg?: HashAlg
  onlyHash?: boolean
  pin?: boolean
  progress?: RemoteCallback<number>
  rawLeaves?: boolean
  shardSplitThreshold?: boolean
  trickle?: boolean
  wrapWithDirectory?: boolean

  timeout?: number
  signal?: AbortSignal
}

export type AddInput = SingleFileInput | MultiFileInput

type SingleFileInput =
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | string
  | RemoteIterable<ArrayBufferView>
  | RemoteIterable<ArrayBuffer>

type MultiFileInput =
  | RemoteIterable<Blob>
  | RemoteIterable<string>
  | RemoteIterable<FileInput>

export type FileInput = {
  path?: string
  content: FileContent
  mode?: Mode
  mtime?: Time
}

export type FileContent =
  | ArrayBufferView
  | ArrayBuffer
  | string
  | RemoteIterable<ArrayBufferView>
  | RemoteIterable<ArrayBuffer>

type AddedEntry = {
  path: string
  cid: StringEncoded<CID>
  mode: number
  mtime: UnixFSTime
  size: number
}

export type AddResult = RemoteIterable<AddedEntry>

export type CatQuery = {
  path: string

  offset?: number
  length?: number
}

export type CatResult = RemoteIterable<Uint8Array>

export type GetQuery = {
  path: string
}

export type GetResult = RemoteIterable<FileEntry>

type FileEntry = {
  path: string
  content: RemoteIterable<Uint8Array>
  mode: number
  mtime: UnixFSTime
}

export type LsQuery = {
  path: string
}

export type LsResult = RemoteIterable<LsEntry>

type LsEntry = {
  depth: number
  name: string
  path: string
  size: number
  cid: StringEncoded<CID>
  type: FileType
  mode: number
  mtime: UnixFSTime
}
