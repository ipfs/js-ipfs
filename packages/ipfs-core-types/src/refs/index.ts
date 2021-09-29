import type { AbortOptions, PreloadOptions, IPFSPath } from '../utils'

export interface API<OptionExtension = {}> {
  /**
   * Get links (references) from an object
   */
  refs: Refs<OptionExtension>

  /**
   * List blocks stored in the local block store
   */
  local: Local<OptionExtension>
}

export interface Refs<OptionExtension = {}> { (ipfsPath: IPFSPath | IPFSPath[], options?: RefsOptions & OptionExtension): AsyncIterable<RefsResult> }

export interface RefsOptions extends AbortOptions, PreloadOptions {
  recursive?: boolean
  unique?: boolean
  format?: string
  edges?: boolean
  maxDepth?: number
}

export interface Local<OptionExtension = {}> { (options?: AbortOptions & OptionExtension): AsyncIterable<RefsResult> }

export interface RefsResult {
  ref: string
  err?: Error
}
