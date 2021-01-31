import CID from 'cids'
import { AwaitIterable } from './basic'

export type Entry<Content extends AsyncIterable<Uint8Array>|Blob> =
  | FileEntry<Content>
  | DirectoryEntry

export interface BaseEntry {
  path: string
  mode?: Mode
  mtime?: MTime
}
export interface FileEntry <Content extends AsyncIterable<Uint8Array>|Blob> extends BaseEntry {
  content?: Content
}

export interface DirectoryEntry extends BaseEntry {
  content?: undefined
}

export type ImportSource =
| AwaitIterable<ToEntry>
| ReadableStream<ToEntry>

export type ToEntry =
  | ToFile
  | ToDirectory
  | ToContent

export interface ToFile extends ToFileMetadata {
  path?: string
  content: ToContent
}

export interface ToDirectory extends ToFileMetadata {
  path: string
  content?: undefined
}

export interface ToFileMetadata {
  mode?: ToMode
  mtime?: ToMTime
}

/**
 * File content in arbitrary (supported) represenation. It is used in input
 * positions and is usually normalized to `Blob` in browser contexts and
 * `AsyncIterable<Uint8Array>` in node.
 */
export type ToContent =
  | string
  | InstanceType<typeof String>
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | AwaitIterable<Uint8Array>
  | ReadableStream<Uint8Array>

/**
 * Timestamp representation in arbitrary (supported) in representations. It is
 * used in input positions and usurally get's normalised to `MTime` before use.
 */
export type ToMTime =
  | Date
  | HRTime
  | MTimeLike

export type ToMode =
  | string
  | number

export interface File {
  readonly type: 'file'
  readonly cid: CID
  readonly name: string

  /**
   * File path
   */
  readonly path: string
  /**
   * File content
   */
  readonly content?: AsyncIterable<Uint8Array>
  mode?: Mode
  mtime?: MTime
  size?: number
  depth?: number
}

export interface Directory {
  type: 'dir'
  cid: CID
  name: string
  /**
   * Directory path
   */
  path: string
  mode?: Mode
  mtime?: MTime
  size?: number
  depth?: number
}

export type IPFSEntry = File | Directory

export interface BaseFile {
  cid: CID
  path: string
  name: string
}

export interface InputFile extends BaseFile {
  unixfs: undefined
}

export interface UnixFSFile extends BaseFile {
  content: () => AsyncIterable<Uint8Array>
  unixfs: UnixFS
}

export interface UnixFSEntry {
  path: string
  cid: CID
  mode: Mode
  mtime: MTime
  size: number
}

export interface MTime {
  /**
   * The number of seconds since(positive) or before (negative) the Unix Epoch
   * began.
   */
  readonly secs: number

  /**
   * The number of nanoseconds since the last full second
   */
  readonly nsecs: number
}

export interface MTimeLike {
  /**
   * The number of seconds since(positive) or before (negative) the Unix Epoch
   * began.
   */
  secs: number

  /**
   * The number of nanoseconds since the last full second
   */
  nsecs?: number
}

interface UnixFS {
  readonly type: 'directory' | 'file' | 'dir'
  readonly mode: Mode
  readonly mtime: MTime

  fileSize: () => number
  content: () => AsyncIterable<Uint8Array>
}

/**
 * Time representation as tuple of two integers, as per the output of
 * [`process.hrtime()`](https://nodejs.org/dist/latest/docs/api/process.html#process_process_hrtime_time).
 */
type HRTime = [number, number]

// It's just a named type alias, but it better captures intent.
export type Mode = number
