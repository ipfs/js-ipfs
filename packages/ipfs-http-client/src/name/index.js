import { createPublish } from './publish.js'
import { createResolve } from './resolve.js'
import { PubsubAPI } from './pubsub/index.js'

export class NameAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.publish = createPublish(config)
    this.resolve = createResolve(config)
    this.pubsub = new PubsubAPI(config)
  }
}
