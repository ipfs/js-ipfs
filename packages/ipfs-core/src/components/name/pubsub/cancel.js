import { getPubsubRouting } from './utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('../../ipns').IPNSAPI} config.ipns
 * @param {import('../../../types').Options} config.options
 */
export function createCancel ({ ipns, options }) {
  const experimental = options.EXPERIMENTAL

  /**
   * @type {import('ipfs-core-types/src/name/pubsub').API<{}>["cancel"]}
   */
  async function cancel (name, options = {}) { // eslint-disable-line require-await
    const pubsub = getPubsubRouting(ipns, experimental)
    return pubsub.cancel(name, options)
  }

  return withTimeoutOption(cancel)
}
