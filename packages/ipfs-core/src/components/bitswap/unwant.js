'use strict'

const CID = require('cids')
const errCode = require('err-code')
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

    try {
      cids = cids.map((cid) => new CID(cid))
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }

    return bitswap.unwant(cids)
  }

  return withTimeoutOption(unwant)
}
