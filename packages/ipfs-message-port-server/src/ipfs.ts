import { DAGNode } from 'ipfs-message-port-protocol/src/dag'
import CID from 'cids'
import {
  FileType,
  UnixFSTime,
  HashAlg,
  Time,
  CIDVersion
} from 'ipfs-message-port-protocol/src/data'
import { EncodedCID } from './block'
import { ReadStream } from 'fs'

type Mode = string | number
export interface IPFS extends Core {
  dag: DAG
  files: Files
  block: BlockService
}

export interface IPFSFactory {
  create(): Promise<IPFS>
}

export interface AbortOptions {
  timeout?: number
  signal?: AbortSignal
}

export interface PutOptions extends AbortOptions {
  format?: string | void
  hashAlg?: string | void
  cid?: CID | void
  preload?: boolean
  pin?: boolean
}

export interface GetOptions extends AbortOptions {
  path?: string,
  localResolve?: boolean
}

export interface ResolveOptions extends AbortOptions {
  path?: string
}

export interface TreeOptions extends AbortOptions {
  path?: string,
  recursive?: boolean
}

export interface DAG {
  put(dagNode: DAGNode, options: PutOptions): Promise<CID>
  get(cid: CID, options: GetOptions): Promise<{ value: DAGNode; remainderPath: string }>
  resolve(pathOrCID: string | CID, options: ResolveOptions): Promise<{ cid: CID, remainderPath: string }>
  tree(cid: CID, options: TreeOptions): AsyncIterable<string>
}

export interface Core {
  addAll(inputs: AddAllInput, options: AddOptions): AsyncIterable<FileOutput>
  add(input: AddInput, options: AddOptions): Promise<FileOutput>
  cat(ipfsPath: CID | string, options: CatOptions): AsyncIterable<Uint8Array>

  ls(ipfsPath: CID | string, options: CoreLsOptions): AsyncIterable<LsEntry>
}

export interface AddOptions extends AbortOptions {
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
}

export type FileInput = {
  path?: string
  content?: FileContent
  mode?: string | number | void
  mtime?: Time
}

export type FileOutput = {
  path: string
  cid: CID
  mode: number
  mtime: { secs: number; nsecs: number }
  size: number
}

export interface CatOptions extends AbortOptions {
  offset?: number
  length?: number
}

interface CoreLsOptions extends AbortOptions {
  preload?: boolean
  recursive?: boolean
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

export interface ChmodOptions extends AbortOptions {
  recursive?: boolean
  flush?: boolean
  hashAlg?: string
  cidVersion?: number
}

interface LsOptions extends AbortOptions {
  sort?: boolean
}

export type LsEntry = {
  name: string
  path: string
  type: FileType
  size: number
  depth: number
  cid: CID
  mode: Mode
  mtime?: UnixFSTime
}

export interface StatOptions extends AbortOptions {
  hash?: boolean
  size?: boolean
  withLocal?: boolean
}

export type Stat = {
  cid: CID
  size: number
  cumulativeSize: number
  type: 'file' | 'directory'
  blocks: number
  withLocality: boolean
  local: boolean
  sizeLocal: number
}

export type WriteContent =
  | string
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | AsyncIterable<ArrayBufferView>

export type AddInput =
  | Blob
  | string
  | ArrayBufferView
  | ArrayBuffer
  | FileInput
  | ReadStream

export type AddAllInput =
  | Iterable<AddInput>
  | AsyncIterable<AddInput>

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
  | Iterable<ArrayBuffer | ArrayBufferView>
  | AsyncIterable<ArrayBuffer | ArrayBufferView>

export interface WriteOptions extends AbortOptions {
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

export type WriteResult = {
  cid: CID
  size: number
}

export interface Block {
  cid: CID
  data: Uint8Array
}

export interface BlockService {
  get(cid: CID, options?: GetBlockOptions): Promise<Block>
  put(block: Block, options?: PutBlockOptions): Promise<Block>
  put(buffer: Uint8Array, options?: PutBufferOptions): Promise<Block>
  rm(
    cid: CID | CID[],
    options?: RmBlockOptions
  ): AsyncIterable<{ cid: CID; error?: Error }>
  stat(
    cid: CID,
    options?: StatBlockOptions
  ): Promise<{ cid: CID; size: number }>
}

export interface GetBlockOptions extends AbortOptions { } // eslint-disable-line @typescript-eslint/no-empty-interface
export interface PutBlockOptions extends AbortOptions {
  format?: string
  mhtype?: string
  mhlen?: number
  version?: number
  pin?: boolean
}
export interface PutBufferOptions extends PutBlockOptions {
  cid?: EncodedCID | void
}

export interface RmBlockOptions extends AbortOptions {
  force?: boolean
  quiet?: boolean
}

export interface StatBlockOptions extends AbortOptions { } // eslint-disable-line @typescript-eslint/no-empty-interface
