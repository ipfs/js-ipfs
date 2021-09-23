import { createLevel } from './level.js'
import { createLs } from './ls.js'
import { createTail } from './tail.js'

/**
 * @param {import('../types').Options} config
 */
export function createLog (config) {
  return {
    level: createLevel(config),
    ls: createLs(config),
    tail: createTail(config)
  }
}
