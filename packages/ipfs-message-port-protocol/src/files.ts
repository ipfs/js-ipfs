import {
  StringEncoded,
  Time,
  Mode,
  HashAlg,
  RemoteIterable,
  FileType
} from './data'
import CID from 'cids'

interface Files {
  chmod(input: ChmodQuery): Promise<void>
  cp(input: CpQuery): Promise<void>
  mkdir(input: MkdirQuery): Promise<void>
  stat(input: StatQuery): Promise<Stat>
  touch(input: TouchQuery): Promise<void>
  rm(input: RmQuery): Promise<void>
  read(input: ReadQuery): Promise<ReadOutput>
  write(input: WriteQuery): Promise<WriteOutput>
  mv(input: MvQuery): Promise<void>
  flush(input: FlushQuery): Promise<StringEncoded<CID>>
  ls(input: LsQuery): Promise<LsOutput>
}

type ChmodQuery = {
  path: string
  mode: Mode
  recursive?: boolean
  hashAlg?: HashAlg
  flush?: boolean
  cidVersion?: number
}

type CpQuery = {
  from: string | StringEncoded<CID>
  to: string | StringEncoded<CID>
  parents?: boolean
  hashAlg?: HashAlg
  flush?: boolean
}

type MkdirQuery = {
  path: string
  // Note: Date objects seem to get copied over message port preserving
  // Date type.
  mtime?: Time
  parents?: boolean
  flush?: boolean
  hashAlg?: HashAlg
  mode?: Mode
}

type StatQuery = {
  path: string
  size?: boolean
  hash?: HashAlg
  withLocal?: boolean
}

type Stat = {
  type: FileType
  cid: StringEncoded<CID>
  size: number
  cumulativeSize: number
  blocks: number
  withLocality: boolean
  local: boolean
  sizeLocal: number
}

type TouchQuery = {
  path: string
  mtime?: Time
  flush?: boolean
  hashAlg?: HashAlg
  cidVersion?: number
}

type RmQuery = {
  paths: string[]
  recursive?: boolean
  flush?: boolean
  hashAlg?: HashAlg
  cidVersion?: number
}

type ReadQuery = {
  path: string

  offset?: number
  length?: number
}

type ReadOutput = {
  content: RemoteIterable<Uint8Array>
}

type WriteContent =
  | string
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | RemoteIterable<Uint8Array>

type WriteQuery = {
  path: string
  content: WriteContent
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
  cidVersion?: number
}

type WriteOutput = {
  cid: StringEncoded<CID>
  size: number
}

type MvQuery = {
  from: string | string[]
  to: string

  parents: boolean
  flush: boolean
  hashAlg: HashAlg
  cidVersion: number
}

type FlushQuery = {
  path: string
}

type LsQuery = {
  path: string
}

type Entry = {
  name: string
  type: FileType
  size: number
  cid: StringEncoded<CID>
  mode: Mode
  mtime: Time
}

type LsOutput = {
  entries: RemoteIterable<Entry>
}
