import { createGc } from './gc.js'
import { createStat } from './stat.js'
import { createVersion } from './version.js'

/**
 * @param {import('../types').Options} config
 */
export function createRepo (config) {
  return {
    gc: createGc(config),
    stat: createStat(config),
    version: createVersion(config)
  }
}
