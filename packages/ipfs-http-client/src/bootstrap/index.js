import { createAdd } from './add.js'
import { createClear } from './clear.js'
import { createList } from './list.js'
import { createReset } from './reset.js'
import { createRm } from './rm.js'

/**
 * @param {import('../types').Options} config
 */
export function createBootstrap (config) {
  return {
    add: createAdd(config),
    clear: createClear(config),
    list: createList(config),
    reset: createReset(config),
    rm: createRm(config)
  }
}
