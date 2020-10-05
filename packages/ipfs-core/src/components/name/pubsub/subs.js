'use strict'

const { getPubsubRouting } = require('./utils')
const { withTimeoutOption } = require('../../../utils')

module.exports = ({ ipns, options: constructorOptions }) => {
  /**
   * Show current name subscriptions.
   *
   * @param {AbortOptions} [options]
   * @returns {Promise<string[]>}
   * @example
   * ```js
   * const result = await ipfs.name.pubsub.subs()
   * console.log(result)
   * // Logs: ['/ipns/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm']
   * ```
   */
  async function subs (options) { // eslint-disable-line require-await
    const pubsub = getPubsubRouting(ipns, constructorOptions)
    return pubsub.getSubscriptions(options)
  }

  return withTimeoutOption(subs)
}

/**
 * @typedef {import('../../../utils').AbortOptions} AbortOptions
 */
