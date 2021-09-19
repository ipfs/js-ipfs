import { createGc } from './gc.js'
import { createStat } from './stat.js'
import { createVersion } from './version.js'

export class RepoAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.gc = createGc(config)
    this.stat = createStat(config)
    this.version = createVersion(config)
  }
}
