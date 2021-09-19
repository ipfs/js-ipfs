
import { createGet } from './get.js'
import { createPut } from './put.js'
import { createRm } from './rm.js'
import { createStat } from './stat.js'

export class BlockAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.get = createGet(config)
    this.put = createPut(config)
    this.rm = createRm(config)
    this.stat = createStat(config)
  }
}
