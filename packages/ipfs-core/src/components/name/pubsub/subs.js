import { getPubsubRouting } from './utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('../../ipns').IPNSAPI} config.ipns
 * @param {import('../../../types').Options} config.options
 */
export function createSubs ({ ipns, options }) {
  const experimental = options.EXPERIMENTAL

  /**
   * @type {import('ipfs-core-types/src/name/pubsub').API<{}>["subs"]}
   */
  async function subs (options = {}) { // eslint-disable-line require-await
    const pubsub = getPubsubRouting(ipns, experimental)
    return pubsub.getSubscriptions(options)
  }

  return withTimeoutOption(subs)
}
