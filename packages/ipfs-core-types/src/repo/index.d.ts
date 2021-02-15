import type { AbortOptions } from '../basic'
import type BigInteger from 'bignumber.js'
import CID from 'cids'

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
}

export interface GCSuccess {
  cid: CID
}

export type GCResult  = GCSuccess | GCError

export interface StatResult {
  numObjects: BigInteger
  repoPath: string
  repoSize: BigInteger
  version: string
  storageMax: BigInteger
}
