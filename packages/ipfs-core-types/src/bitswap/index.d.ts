import type BigInteger from 'bignumber.js'
import type PeerId from 'peer-id'
import type CID from 'cids'
import type { AbortOptions } from '../basic'

export interface API<OptionExtension = {}> {
  /**
   * Returns the wantlist for your node
   *
   * @example
   * ```js
   * const list = await ipfs.bitswap.wantlist()
   * console.log(list)
   * // [ CID('QmHash') ]
   * ```
   */
  wantlist: (options?: AbortOptions & OptionExtension) => Promise<CID[]>

  /**
   * Returns the wantlist for a connected peer
   *
   * @example
   * ```js
   * const list = await ipfs.bitswap.wantlistForPeer(peerId)
   * console.log(list)
   * // [ CID('QmHash') ]
   * ```
   */
  wantlistForPeer: (peerId, options?: AbortOptions & OptionExtension) => Promise<CID[]>

  /**
   * Removes one or more CIDs from the wantlist
   *
   * @example
   * ```JavaScript
   * let list = await ipfs.bitswap.wantlist()
   * console.log(list)
   * // [ CID('QmHash') ]
   *
   * await ipfs.bitswap.unwant(cid)
   *
   * list = await ipfs.bitswap.wantlist()
   * console.log(list)
   * // []
   * ```
   */
  unwant: (cids: CID | CID[], options?: AbortOptions & OptionExtension) => Promise<void>

  /**
   * Show diagnostic information on the bitswap agent.
   * Note: `bitswap.stat` and `stats.bitswap` can be used interchangeably.
   *
   * @example
   * ```js
   * const stats = await ipfs.bitswap.stat()
   * console.log(stats)
   * ```
   */
  stat: (options?: AbortOptions & OptionExtension) => Promise<Stats>
}

export interface Stats {
  provideBufLen: number
  wantlist: CID[]
  peers: CID[]
  blocksReceived: BigInteger
  dataReceived: BigInteger
  blocksSent: BigInteger
  dataSent: BigInteger
  dupBlksReceived: BigInteger
  dupDataReceived: BigInteger
}
