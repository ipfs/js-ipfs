import { createCancel } from './cancel.js'
import { createState } from './state.js'
import { createSubs } from './subs.js'

export class PubsubAPI {
  /**
   * @param {import('../../types').Options} config
   */
  constructor (config) {
    this.cancel = createCancel(config)
    this.state = createState(config)
    this.subs = createSubs(config)
  }
}
