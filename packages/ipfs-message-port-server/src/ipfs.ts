import { DAGNode } from 'ipfs-message-port-protocol/src/dag'
import CID from 'cids'
import {
  FileType,
  UnixFSTime,
  HashAlg,
  Time,
  CIDVersion
} from 'ipfs-message-port-protocol/src/data'

type Mode = string | number
export interface IPFS extends Core {
  dag: DAG
  files: Files
}

export interface IPFSFactory {
  create(): Promise<IPFS>
}

type PutOptions = {
  format?: string | void
  hashAlg?: string | void
  cid?: CID | void
  preload?: boolean
  pin?: boolean
  timeout?: number
  signal?: AbortSignal
}

type GetOptions = {
  localResolve?: boolean
  timeout?: number
  signal?: AbortSignal
}

type TreeOptions = {
  recursive?: boolean
  timeout?: number
  signal?: AbortSignal | void
}

export interface DAG {
  put(dagNode: DAGNode, options: PutOptions): Promise<CID>
  get(
    cid: CID,
    path: string,
    options: GetOptions
  ): Promise<{ value: DAGNode; remainderPath: string }>
  tree(cid: CID, path: string, options: TreeOptions): AsyncIterable<string>
}

export interface Core {
  add(inputs: AddInput, options: AddOptions): AsyncIterable<FileOutput>
  cat(ipfsPath: CID | string, options: CatOptions): AsyncIterable<Buffer>
}

type AddOptions = {
  chunker?: string
  cidVersion?: number
  enableShardingExperiment?: boolean
  hashAlg?: HashAlg
  onlyHash?: boolean
  pin?: boolean
  progress?: (progress: number) => void
  rawLeaves?: boolean
  shardSplitThreshold?: number
  trickle?: boolean
  wrapWithDirectory?: boolean

  timeout?: number
  signal?: AbortSignal
}

export type FileInput = {
  path: string
  content: string | AsyncIterable<ArrayBuffer | ArrayBufferView>
  mode: string | number | void
  mtime: { secs: number; nsecs?: number } | void
}

export type FileOutput = {
  path: string
  cid: CID
  mode: number
  mtime: { secs: number; nsecs: number }
  size: number
}

export type CatOptions = {
  offset?: number
  length?: number
  timeout?: number
  signal?: AbortSignal
}

export interface Files {
  chmod(path: string | CID, mode: Mode, options?: ChmodOptions): Promise<void>

  write(
    path: string,
    content: WriteContent,
    options?: WriteOptions
  ): Promise<WriteResult>

  ls(path?: string, opitons?: LsOptions): AsyncIterable<LsEntry>

  stat(path: string, options?: StatOptions): Promise<Stat>
}

type ChmodOptions = {
  recursive: boolean
  flush: boolean
  hashAlg: string
  cidVersion: number
  timeout: number
  signal: AbortSignal
}

type LsOptions = {
  sort?: boolean
  timeout?: number
  signal?: AbortSignal
}

type LsEntry = {
  name: string
  type: FileType
  size: number
  cid: CID
  mode: Mode
  mtime: UnixFSTime
}

type StatOptions = {
  hash?: boolean
  size?: boolean
  withLocal?: boolean
  timeout?: number
  signal?: AbortSignal
}

type Stat = {
  cid: CID
  size: number
  cumulativeSize: number
  type: 'file' | 'directory'
  blocks: number
  withLocality: boolean
  local: boolean
  sizeLocal: number
}

type WriteContent =
  | string
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | AsyncIterable<ArrayBufferView>

type AddInput = SingleFileInput | MultiFileInput

type SingleFileInput =
  | string
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | FileObject
  | Iterable<number>
  | Iterable<ArrayBufferView>
  | Iterable<ArrayBuffer>
  | AsyncIterable<ArrayBufferView>
  | AsyncIterable<ArrayBuffer>

type MultiFileInput =
  | Iterable<Blob>
  | Iterable<string>
  | Iterable<FileObject>
  | AsyncIterable<Blob>
  | AsyncIterable<string>
  | AsyncIterable<FileObject>

export type FileObject = {
  path?: string
  content?: FileContent
  mode?: Mode
  mtime?: Time
}

export type FileContent =
  | string
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | Iterable<number>
  | Iterable<ArrayBufferView>
  | Iterable<ArrayBuffer>
  | AsyncIterable<ArrayBufferView>
  | AsyncIterable<ArrayBuffer>

type WriteOptions = {
  offset?: number
  length?: number
  create?: boolean
  parents?: boolean
  truncate?: boolean
  rawLeaves?: boolean
  mode?: Mode
  mtime?: Time
  flush?: boolean
  hashAlg?: HashAlg
  cidVersion?: CIDVersion
}

type WriteResult = {
  cid: CID
  size: number
}
