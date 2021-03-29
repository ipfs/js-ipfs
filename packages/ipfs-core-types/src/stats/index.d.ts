import type { AbortOptions } from '../utils'
import { API as BitswapAPI } from '../bitswap'
import { API as RepoAPI } from '../repo'
import type CID from 'cid'
import type BigInteger from 'bignumber.js'

export interface API<OptionExtension = {}> {
  bitswap: BitswapAPI<OptionExtension>["stat"]
  repo: RepoAPI<OptionExtension>["stat"]

  /**
   * Return bandwith usage stats
   */
  bw: (options?: BWOptions & OptionExtension) => AsyncIterable<BWResult>
}

export interface BWOptions extends AbortOptions {
  peer?: CID | string
  proto?: string
  poll?: boolean
  interval?: number
}

export interface BWResult {
  totalIn: BigInteger
  totalOut: BigInteger
  rateIn: BigInteger
  rateOut: BigInteger
}
