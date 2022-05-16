import type { AbortOptions } from '../utils'
import type { API as BitswapAPI } from '../bitswap'
import type { API as RepoAPI } from '../repo'
import type { PeerId } from '@libp2p/interfaces/peer-id'

export interface API<OptionExtension = {}> {
  bitswap: BitswapAPI<OptionExtension>['stat']
  repo: RepoAPI<OptionExtension>['stat']

  /**
   * Return bandwith usage stats
   */
  bw: (options?: BWOptions & OptionExtension) => AsyncIterable<BWResult>
}

export interface BWOptions extends AbortOptions {
  /**
   * Specifies a peer to print bandwidth for
   */
  peer?: PeerId

  /**
   * Specifies a protocol to print bandwidth for
   */
  proto?: string

  /**
   * Is used to yield bandwidth info at an interval
   */
  poll?: boolean

  /**
   * The time interval to wait between updating output, if `poll` is `true`.
   */
  interval?: number | string
}

export interface BWResult {
  totalIn: bigint
  totalOut: bigint
  rateIn: number
  rateOut: number
}
