import { createLevel } from './level.js'
import { createLs } from './ls.js'
import { createTail } from './tail.js'

export class LogAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.level = createLevel(config)
    this.ls = createLs(config)
    this.tail = createTail(config)
  }
}
