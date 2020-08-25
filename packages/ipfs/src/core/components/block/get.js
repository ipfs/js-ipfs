'use strict'

const { cleanCid } = require('./utils')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ blockService, preload }) => {
  /**
   * @typedef {import('cids')} CID
   * @typedef {import('ipld-block')} Block
   */

  /**
   * Get a raw IPFS block.
   *
   * @param {CID | string | Buffer} cid - A CID that corresponds to the desired block
   * @param {object} [options]
   * @param {boolean} [options.preload] - (default: `true`)
   * @param {Number} [options.timeout] - A timeout in ms (default: `undefined`)
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long running requests started as a result of this call (default: `undefined`)
   *
   * @returns {Promise<Block>} - A Block type object, containing both the data and the hash of the block
   */
  async function get (cid, options) { // eslint-disable-line require-await
    options = options || {}
    cid = cleanCid(cid)

    if (options.preload !== false) {
      preload(cid)
    }

    return blockService.get(cid, options)
  }

  return withTimeoutOption(get)
}
