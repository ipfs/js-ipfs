'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('../../types').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * @type {import('ipfs-core-types/src/bitswap').API["unwant"]}
   */
  async function unwant (cids, options = {}) {
    const { bitswap } = await network.use(options)

    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    return bitswap.unwant(cids)
  }

  return withTimeoutOption(unwant)
}
