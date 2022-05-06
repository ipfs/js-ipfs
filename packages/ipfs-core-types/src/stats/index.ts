import type { AbortOptions } from '../utils'
import type { API as BitswapAPI } from '../bitswap'
import type { API as RepoAPI } from '../repo'

export interface API<OptionExtension = {}> {
  bitswap: BitswapAPI<OptionExtension>['stat']
  repo: RepoAPI<OptionExtension>['stat']

  /**
   * Return bandwith usage stats
   */
  bw: (options?: BWOptions & OptionExtension) => AsyncIterable<BWResult>
}

export interface BWOptions extends AbortOptions {
  peer?: string
  proto?: string
  poll?: boolean
  interval?: number | string
}

export interface BWResult {
  totalIn: bigint
  totalOut: bigint
  rateIn: number
  rateOut: number
}
