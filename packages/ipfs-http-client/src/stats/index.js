import { createStat as createBitswap } from '../bitswap/stat.js'
import { createStat as createRepo } from '../repo/stat.js'
import { createBw } from './bw.js'

/**
 * @param {import('../types').Options} config
 */
export function createStats (config) {
  return {
    bitswap: createBitswap(config),
    repo: createRepo(config),
    bw: createBw(config)
  }
}
