import { createStat as createBitswap } from '../bitswap/stat.js'
import { createStat as createRepo } from '../repo/stat.js'
import { createBw } from './bw.js'

export class StatsAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.bitswap = createBitswap(config)
    this.repo = createRepo(config)
    this.bw = createBw(config)
  }
}
