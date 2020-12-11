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
   * Show current name subscriptions.
   *
   * @param {import('.').AbortOptions} [options]
   * @returns {Promise<string[]>}
   * @example
   * ```js
   * const result = await ipfs.name.pubsub.subs()
   * console.log(result)
   * // Logs: ['/ipns/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm']
   * ```
   */
  async function subs (options) { // eslint-disable-line require-await
    const pubsub = getPubsubRouting(ipns, routingOptions)
    return pubsub.getSubscriptions(options)
  }

  return withTimeoutOption(subs)
}
