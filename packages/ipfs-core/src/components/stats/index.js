import { createBw } from './bw.js'
import { createStat as createRepo } from '../repo/stat.js'
import { createStat as createBitswap } from '../bitswap/stat.js'

export class StatsAPI {
  /**
   * @param {object} config
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {import('../../types').NetworkService} config.network
   */
  constructor ({ repo, network }) {
    this.repo = createRepo({ repo })
    this.bw = createBw({ network })
    this.bitswap = createBitswap({ network })
  }
}
