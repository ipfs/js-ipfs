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
   * @type {import('ipfs-core-types/src/name/pubsub').API["cancel"]}
   */
  async function cancel (name, options = {}) { // eslint-disable-line require-await
    const pubsub = getPubsubRouting(ipns, experimental)
    return pubsub.cancel(name, options)
  }

  return withTimeoutOption(cancel)
}
