'use strict'

const { getPubsubRouting } = require('./utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').IPNS} config.ipns
 * @param {import('.').Options} [config.options]
 */
module.exports = ({ ipns, options: routingOptions }) => {
  /**
   * Cancel a name subscription.
   *
   * @param {string} name - The name of the subscription to cancel.
   * @param {import('.').AbortOptions} [options]
   * @returns {Promise<{ canceled: boolean }>}
   * @example
   * ```js
   * const name = 'QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm'
   * const result = await ipfs.name.pubsub.cancel(name)
   * console.log(result.canceled)
   * // Logs: true
   * ```
   */
  async function cancel (name, options) { // eslint-disable-line require-await
    const pubsub = getPubsubRouting(ipns, routingOptions)
    return pubsub.cancel(name, options)
  }

  return withTimeoutOption(cancel)
}
