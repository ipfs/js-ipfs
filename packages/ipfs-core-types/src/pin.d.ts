import CID from 'cids'
import { AbortOptions, AwaitIterable } from './basic'

export interface API {
  /**
   * Adds an IPFS object to the pinset and also stores it to the IPFS repo.
   * pinset is the set of hashes currently pinned (not gc'able)
   */
  add: (source: CID|string, options?: AddOptions) => Promise<CID>
  /**
   * Adds multiple IPFS objects to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able)
   */
  addAll: (source: PinSource, options?: AddAllOptions) => AsyncIterable<CID>

  /**
   * Unpin this block from your repo
   */
  rm: (source: CID|string, options?: RemoveOptions) => Promise<CID>

  /**
   *
   */
  rmAll: (source: PinSource, options?: RemoveAllOptions) => AsyncIterable<CID>

  /**
   * List all the objects pinned to local storage
   */
  ls: (options?: ListOptions) => AsyncIterable<PinEntry>
}

export interface AddAllOptions extends AbortOptions {
  /**
   * Recursively pin all links contained by the object
   */
  recursive?: boolean
  lock?: boolean
}

export interface AddOptions extends AddAllOptions {
  metadata?: any
}

export type ToPin =
  | CID
  | string
  | ToPinWithCID
  | ToPinWithPath

export interface ToPinWithPath {
  path: string | CID
  cid?: undefined
  recursive?: boolean
  metadata?: any
}

export interface ToPinWithCID {
  path?: undefined
  cid: CID
  recursive?: boolean
  metadata?: any
}

export type PinSource =
  | ToPin
  | Iterable<ToPin>
  | AwaitIterable<ToPin>

export interface RemoveAllOptions extends AbortOptions {
}
export interface RemoveOptions extends RemoveAllOptions {
  recursive?: boolean
}

export interface ListOptions extends AbortOptions {
  paths?: Array<string|CID>|string|CID
  type?: PinQueryType
}

export interface PinEntry {
  /**
   * CID of the pinned node
   */
  cid: CID
  /**
   * Pin type ("recursive", "direct" or "indirect")
   */
  type: PinType
}
export type PinType =
  | 'direct'
  | 'recursive'
  | 'indirect'

export type PinQueryType =
  | PinType
  | 'all'
