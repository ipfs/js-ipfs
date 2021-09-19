
/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pubsub').API<HTTPClientExtraOptions>} PubsubAPI
 * @typedef {import('../types').Options} Options
 */

/**
 * @param {Options} options
 * @param {import('./subscription-tracker').SubscriptionTracker} subsTracker
 */
export const createUnsubscribe = (options, subsTracker) => {
  /**
   * @type {PubsubAPI["unsubscribe"]}
   */
  async function unsubscribe (topic, handler) {
    subsTracker.unsubscribe(topic, handler)
  }
  return unsubscribe
}
