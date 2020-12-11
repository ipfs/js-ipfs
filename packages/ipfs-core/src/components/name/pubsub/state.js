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
   * Query the state of IPNS pubsub.
   *
   * @param {import('.').AbortOptions} [_options]
   * @returns {Promise<{ enabled: boolean }>}
   * ```js
   * const result = await ipfs.name.pubsub.state()
   * console.log(result.enabled)
   * // Logs: true
   * ```
   */
  async function state (_options) { // eslint-disable-line require-await
    try {
      return { enabled: Boolean(getPubsubRouting(ipns, routingOptions)) }
    } catch (err) {
      return { enabled: false }
    }
  }

  return withTimeoutOption(state)
}
