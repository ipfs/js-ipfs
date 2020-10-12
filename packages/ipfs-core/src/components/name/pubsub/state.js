'use strict'

const { getPubsubRouting } = require('./utils')
const { withTimeoutOption } = require('../../../utils')

module.exports = ({ ipns, options: constructorOptions }) => {
  /**
   * Query the state of IPNS pubsub.
   *
   * @param {AbortOptions} [options]
   * @returns {Promise<{ enabled: boolean }>}
   * ```js
   * const result = await ipfs.name.pubsub.state()
   * console.log(result.enabled)
   * // Logs: true
   * ```
   */
  // @ts-ignore - 'options' is declared but its value is never read.ts(6133)
  async function state (options) { // eslint-disable-line require-await
    try {
      return { enabled: Boolean(getPubsubRouting(ipns, constructorOptions)) }
    } catch (err) {
      return { enabled: false }
    }
  }

  return withTimeoutOption(state)
}

/**
 * @typedef {import('../../../utils').AbortOptions} AbortOptions
 */
