'use strict'

const SubscriptionTracker = require('./subscription-tracker')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pubsub').API<HTTPClientExtraOptions>} PubsubAPI
 */

/**
 * @param {import('../types').Options} config
 */
module.exports = config => {
  const subsTracker = SubscriptionTracker.singleton()

  /**
   * @type {PubsubAPI["unsubscribe"]}
   */
  async function unsubscribe (topic, handler) {
    subsTracker.unsubscribe(topic, handler)
  }
  return unsubscribe
}
