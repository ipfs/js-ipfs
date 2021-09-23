import { createAddAll } from './add-all.js'
import { createAdd } from './add.js'
import { createLs } from './ls.js'
import { createRmAll } from './rm-all.js'
import { createRm } from './rm.js'
import { createRemote } from './remote/index.js'

/**
 * @param {import('../types').Options} config
 */
export function createPin (config) {
  return {
    addAll: createAddAll(config),
    add: createAdd(config),
    ls: createLs(config),
    rmAll: createRmAll(config),
    rm: createRm(config),
    remote: createRemote(config)
  }
}
