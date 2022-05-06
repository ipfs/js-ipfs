import { getPubsubRouting } from './utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('../../ipns').IPNSAPI} config.ipns
 * @param {import('../../../types').Options} config.options
 */
export function createState ({ ipns, options }) {
  const experimental = options.EXPERIMENTAL

  /**
   * @type {import('ipfs-core-types/src/name/pubsub').API<{}>["state"]}
   */
  async function state (_options = {}) { // eslint-disable-line require-await
    try {
      return { enabled: Boolean(getPubsubRouting(ipns, experimental)) }
    } catch (/** @type {any} */ err) {
      return { enabled: false }
    }
  }

  return withTimeoutOption(state)
}
