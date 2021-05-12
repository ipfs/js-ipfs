'use strict'

const { getPubsubRouting } = require('./utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('../../ipns')} config.ipns
 * @param {import('../../../types').Options} config.options
 */
module.exports = ({ ipns, options }) => {
  const experimental = options.EXPERIMENTAL

  /**
   * @type {import('ipfs-core-types/src/name/pubsub').API["subs"]}
   */
  async function subs (options = {}) { // eslint-disable-line require-await
    const pubsub = getPubsubRouting(ipns, experimental)
    return pubsub.getSubscriptions(options)
  }

  return withTimeoutOption(subs)
}
