'use strict'

const CID = require('cids')
const errCode = require('err-code')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('multibase').BaseName} BaseName
 */

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/object').API["get"]}
   */
  async function get (multihash, options = {}) { // eslint-disable-line require-await
    let cid

    try {
      cid = new CID(multihash)
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }

    if (options.preload !== false) {
      preload(cid)
    }

    return ipld.get(cid, { signal: options.signal })
  }

  return withTimeoutOption(get)
}
