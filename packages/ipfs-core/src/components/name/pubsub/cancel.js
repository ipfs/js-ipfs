'use strict'

const { getPubsubRouting } = require('./utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('../../../ipns')} config.ipns
 * @param {import('../../init').ConstructorOptions<any, any>} config.options
 */
module.exports = ({ ipns, options: constructorOptions }) => {
  /**
   * Cancel a name subscription.
   *
   * @param {string} name - The name of the subscription to cancel.
   * @param {AbortOptions} [options]
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
    const pubsub = getPubsubRouting(ipns, constructorOptions)
    return pubsub.cancel(name, options)
  }

  return withTimeoutOption(cancel)
}

/**
 * @typedef {import('../../../utils').AbortOptions} AbortOptions
 */
