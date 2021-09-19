import { createAddAll } from './add-all.js'
import { createAdd } from './add.js'
import { createLs } from './ls.js'
import { createRmAll } from './rm-all.js'
import { createRm } from './rm.js'
import { RemoteAPI } from './remote/index.js'

export class PinAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.addAll = createAddAll(config)
    this.add = createAdd(config)
    this.ls = createLs(config)
    this.rmAll = createRmAll(config)
    this.rm = createRm(config)
    this.remote = new RemoteAPI(config)
  }
}
