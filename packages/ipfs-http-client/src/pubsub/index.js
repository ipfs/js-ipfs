import { createLs } from './ls.js'
import { createPeers } from './peers.js'
import { createPublish } from './publish.js'
import { createSubscribe } from './subscribe.js'
import { createUnsubscribe } from './unsubscribe.js'
import { SubscriptionTracker } from './subscription-tracker.js'

/**
 * @param {import('../types').Options} config
 */
export function createPubsub (config) {
  const subscriptionTracker = new SubscriptionTracker()

  return {
    ls: createLs(config),
    peers: createPeers(config),
    publish: createPublish(config),
    subscribe: createSubscribe(config, subscriptionTracker),
    unsubscribe: createUnsubscribe(config, subscriptionTracker)
  }
}
