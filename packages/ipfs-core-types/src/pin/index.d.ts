import type { AbortOptions, AwaitIterable } from '../utils'
import type CID from 'cids'
import type { API as Remote } from './remote'

export interface API<OptionExtension = {}> {
  /**
   * Adds an IPFS block to the pinset and also stores it to the IPFS
   * repo. pinset is the set of hashes currently pinned (not gc'able)
   *
   * @example
   * ```js
   * const cid = CID.from('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * const pinned of ipfs.pin.add(cid))
   * console.log(pinned)
   * // Logs:
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  add: (cid: string | CID, options?: AddOptions & OptionExtension) => Promise<CID>

  /**
   * Adds multiple IPFS blocks to the pinset and also stores it to the IPFS
   * repo. pinset is the set of hashes currently pinned (not gc'able)
   *
   * @example
   * ```js
   * const cid = CID.from('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * for await (const cid of ipfs.pin.addAll([cid])) {
   *   console.log(cid)
   * }
   * // Logs:
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  addAll: (source: AwaitIterable<AddInput>, options?: AddAllOptions & OptionExtension) => AsyncIterable<CID>

  /**
   * List all the objects pinned to local storage
   *
   * @example
   * ```js
   * for await (const { cid, type } of ipfs.pin.ls()) {
   *   console.log({ cid, type })
   * }
   * // { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
   * // { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
   * // { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
   *
   * const paths = [
   *   CID.from('Qmc5..'),
   *   CID.from('QmZb..'),
   *   CID.from('QmSo..')
   * ]
   * for await (const { cid, type } of ipfs.pin.ls({ paths })) {
   *   console.log({ cid, type })
   * }
   * // { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
   * // { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
   * // { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
   * ```
   */
  ls: (options?: LsOptions & OptionExtension) => AsyncIterable<LsResult>

  /**
   * Unpin this block from your repo
   *
   * @example
   * ```js
   * const cid = CID.from('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * const result = await ipfs.pin.rm(cid)
   * console.log(result)
   * // prints the CID that was unpinned
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  rm: (ipfsPath: string | CID, options?: RmOptions & OptionExtension) => Promise<CID>

  /**
   * Unpin one or more blocks from your repo
   *
   * @example
   * ```js
   * const source = [
   *   CID.from('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ]
   * for await (const cid of ipfs.pin.rmAll(source)) {
   *   console.log(cid)
   * }
   * // prints the CIDs that were unpinned
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  rmAll: (source: AwaitIterable<RmAllInput>, options?: AbortOptions & OptionExtension) => AsyncIterable<CID>

  remote: Remote<OptionExtension>
}

export interface AddOptions extends AbortOptions {
  /**
   * If true, pin all blocked linked to from the pinned CID
   */
  recursive?: boolean

  /**
   * Whether to preload all blocks pinned during this operation
   */
  preload?: boolean

  /**
   * Internal option used to control whether to create a repo write lock during a pinning operation
   */
  lock?: boolean
}

export interface AddAllOptions extends AbortOptions {
  /**
   * Whether to preload all blocks pinned during this operation
   */
  preload?: boolean

  /**
   * Internal option used to control whether to create a repo write lock during a pinning operation
   */
  lock?: boolean
}

export interface AddInput {
  /**
   * A CID to pin - nb. you must pass either `cid` or `path`, not both
   */
  cid?: CID

  /**
   * An IPFS path to pin - nb. you must pass either `cid` or `path`, not both
   */
  path?: string

  /**
   * If true, pin all blocked linked to from the pinned CID
   */
  recursive?: boolean

  /**
   * A human readable string to store with this pin
   */
  comments?: string
}

export type PinType = 'recursive' | 'direct' | 'indirect' | 'all'

export type PinQueryType = 'recursive' | 'direct' | 'indirect' | 'all'

export interface LsOptions  extends AbortOptions {
  paths?: CID | CID[] | string | string[]
  type?: PinQueryType
}

export interface LsResult {
  cid: CID
  type: PinType | string
  metadata?: Record<string, any>
}

export interface RmOptions extends AbortOptions {
  recursive?: boolean
}

export interface RmAllInput {
  cid?: CID
  path?: string
  recursive?: boolean
}

