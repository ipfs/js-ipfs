import { createLs } from './ls.js'
import { createPeers } from './peers.js'
import { createPublish } from './publish.js'
import { createSubscribe } from './subscribe.js'
import { createUnsubscribe } from './unsubscribe.js'
import { SubscriptionTracker } from './subscription-tracker.js'

export class PubsubAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    const subscriptionTracker = new SubscriptionTracker()

    this.ls = createLs(config)
    this.peers = createPeers(config)
    this.ls = createLs(config)
    this.publish = createPublish(config)
    this.subscribe = createSubscribe(config, subscriptionTracker)
    this.unsubscribe = createUnsubscribe(config, subscriptionTracker)
  }
}
