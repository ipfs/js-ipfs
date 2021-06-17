'use strict'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pubsub').API<HTTPClientExtraOptions>} PubsubAPI
 */

/**
 * @param {import('../types').Options} opts
 */
module.exports = opts => {
  if (!opts.subscriptionTracker) {
    throw new Error('Please configure a subscription tracker')
  }

  const subsTracker = opts.subscriptionTracker

  /**
   * @type {PubsubAPI["unsubscribe"]}
   */
  async function unsubscribe (topic, handler) {
    subsTracker.unsubscribe(topic, handler)
  }
  return unsubscribe
}
