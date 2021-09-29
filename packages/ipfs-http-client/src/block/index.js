import { createGet } from './get.js'
import { createPut } from './put.js'
import { createRm } from './rm.js'
import { createStat } from './stat.js'

/**
 * @param {import('../types').Options} config
 */
export function createBlock (config) {
  return {
    get: createGet(config),
    put: createPut(config),
    rm: createRm(config),
    stat: createStat(config)
  }
}
