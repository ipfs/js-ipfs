import { Client } from '../../lib/core.js'
import { createAdd } from './add.js'
import { createLs } from './ls.js'
import { createRm } from './rm.js'
import { createRmAll } from './rm-all.js'
import { createService } from './service/index.js'

/**
 * @param {import('../../types').Options} config
 */
export function createRemote (config) {
  const client = new Client(config)

  return {
    add: createAdd(client),
    ls: createLs(client),
    rm: createRm(client),
    rmAll: createRmAll(client),
    service: createService(config)
  }
}
