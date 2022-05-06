import { createCancel } from './cancel.js'
import { createState } from './state.js'
import { createSubs } from './subs.js'

export class PubSubAPI {
  /**
   * @param {object} config
   * @param {import('../../ipns').IPNSAPI} config.ipns
   * @param {import('../../../types').Options} config.options
   */
  constructor ({ ipns, options }) {
    this.cancel = createCancel({ ipns, options })
    this.state = createState({ ipns, options })
    this.subs = createSubs({ ipns, options })
  }
}
