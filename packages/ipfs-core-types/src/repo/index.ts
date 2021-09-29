import type { AbortOptions } from '../utils'
import type { CID } from 'multiformats/cid'

export interface API<OptionExtension = {}> {
  /**
   * Perform garbage collection on the repo
   *
   * Any unpinned blocks will be deleted
   */
  gc: (options?: GCOptions & OptionExtension) => AsyncIterable<GCResult>

  /**
   * Return stats about the repo
   */
  stat: (options?: AbortOptions & OptionExtension) => Promise<StatResult>

  /**
   * If the repo has been initialized, report the current version,
   * otherwise report the version that would be initialized
   */
  version: (options?: AbortOptions & OptionExtension) => Promise<number>
}

export interface GCOptions extends AbortOptions {
  quiet?: boolean
}

export interface GCError {
  err: Error
  cid?: never
}

export interface GCSuccess {
  err?: never
  cid: CID
}

export type GCResult = GCSuccess | GCError

export interface StatResult {
  numObjects: bigint
  repoPath: string
  repoSize: bigint
  version: string
  storageMax: bigint
}
