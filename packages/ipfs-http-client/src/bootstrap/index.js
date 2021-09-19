
import { createAdd } from './add.js'
import { createClear } from './clear.js'
import { createList } from './list.js'
import { createReset } from './reset.js'
import { createRm } from './rm.js'

export class BootstrapAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.add = createAdd(config)
    this.clear = createClear(config)
    this.list = createList(config)
    this.reset = createReset(config)
    this.rm = createRm(config)
  }
}
