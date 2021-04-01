import { AbortOptions, PreloadOptions, IPFSPath } from '../utils'
import CID, { CIDVersion } from 'cids'
import Block from 'ipld-block'
import { CodecName } from 'multicodec'
import { HashName } from 'multihashes'

export interface API<OptionExtension = {}> {
  /**
   * Get a raw IPFS block
   *
   * @example
   * ```js
   * const block = await ipfs.block.get(cid)
   * console.log(block.data)
   * ```
   */
  get: (cid: CID | string | Uint8Array, options?: AbortOptions & PreloadOptions & OptionExtension) => Promise<Block>

  /**
   * Stores input as an IPFS block.
   *
   * **Note:** If you pass a `Block` instance as the block parameter, you
   * don't need to pass options, as the block instance will carry the CID
   * value as a property.
   *
   * @example
   * ```js
   * // Defaults
   * const encoder = new TextEncoder()
   * const decoder = new TextDecoder()
   *
   * const bytes = encoder.encode('a serialized object')
   * const block = await ipfs.block.put(bytes)
   *
   * console.log(decoder.decode(block.data))
   * // Logs:
   * // a serialized object
   * console.log(block.cid.toString())
   * // Logs:
   * // the CID of the object
   *
   * // With custom format and hashtype through CID
   * const CID = require('cids')
   * const another = encoder.encode('another serialized object')
   * const cid = new CID(1, 'dag-pb', multihash)
   * const block = await ipfs.block.put(another, cid)
   * console.log(decoder.decode(block.data))
   *
   * // Logs:
   * // a serialized object
   * console.log(block.cid.toString())
   * // Logs:
   * // the CID of the object
   * ```
   */
  put: (block: Block | Uint8Array, options?: PutOptions & OptionExtension) => Promise<Block>

  /**
   * Remove one or more IPFS block(s) from the underlying block store
   *
   * @example
   * ```js
   * for await (const result of ipfs.block.rm(cid)) {
   *   if (result.error) {
   *     console.error(`Failed to remove block ${result.cid} due to ${result.error.message}`)
   *   } else {
   *    console.log(`Removed block ${result.cid}`)
   *   }
   * }
   * ```
   */
  rm: (cid: CID | CID[], options?: RmOptions & OptionExtension) => AsyncIterable<RmResult>

  /**
   * Print information of a raw IPFS block
   *
   * @example
   * ```js
   * const cid = CID.from('QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ')
   * const stats = await ipfs.block.stat(cid)
   * console.log(stats.cid.toString())
   * // Logs: QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ
   * console.log(stat.size)
   * // Logs: 3739
   * ```
   */
  stat: (ipfsPath: IPFSPath, options?: AbortOptions & PreloadOptions & OptionExtension) => Promise<StatResult>
}

export interface PutOptions extends AbortOptions, PreloadOptions {
  /**
   *  CID to store the block under - ignored if a Block is passed
   */
  cid?: CID

  /**
   * The codec to use to create the CID
   */
  format?: CodecName

  /**
   * Multihash hashing algorithm to use. (Defaults to 'sha2-256')
   */
  mhtype?: HashName

  /**
   * @deprecated
   */
  mhlen?: any

  /**
   * The version to use to create the CID
   */
  version?: CIDVersion

  /**
   * Pin this block when adding. (Defaults to `false`)
   */
  pin?: boolean
}

export interface RmOptions extends AbortOptions {
  /**
   * Ignores non-existent blocks
   */
  force?: boolean,

  /**
   * Do not return output if true
   */
  quiet?: boolean
}

export interface RmResult {
  /**
   * The CID of the removed block
   */
  cid: CID

  /**
   * Any error that occurred while trying to remove the block
   */
  error?: Error
}

export interface StatResult {
  /**
   * The CID of the block
   */
  cid: CID

  /**
   * The size of the block
   */
  size: number
}
