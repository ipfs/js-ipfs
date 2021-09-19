import { createAddLink } from './add-link.js'
import { createAppendData } from './append-data.js'
import { createRmLink } from './rm-link.js'
import { createSetData } from './set-data.js'

export class PatchAPI {
  /**
   * @param {import('../../types').Options} config
   */
  constructor (config) {
    this.addLink = createAddLink(config)
    this.appendData = createAppendData(config)
    this.rmLink = createRmLink(config)
    this.setData = createSetData(config)
  }
}
