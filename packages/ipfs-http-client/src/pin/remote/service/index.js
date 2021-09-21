import { Client } from '../../../lib/core.js'
import { createAdd } from './add.js'
import { createLs } from './ls.js'
import { createRm } from './rm.js'

/**
 * @param {import('../../../types').Options} config
 */
export function createService (config) {
  const client = new Client(config)

  return {
    add: createAdd(client),
    ls: createLs(client),
    rm: createRm(client)
  }
}
