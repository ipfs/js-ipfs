'use strict'

const CID = require('cids')
const errCode = require('err-code')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const uint8ArrayFromString = require('uint8arrays/from-string')

/**
 * @typedef {import('multibase/src/types').BaseName} BaseName
 */

/**
 * @param {string|Uint8Array|CID} multihash
 * @param {BaseName | 'utf8' | 'utf-8' | 'ascii' | 'base58'} [enc]
 * @returns {string|Uint8Array}
 */
function normalizeMultihash (multihash, enc) {
  if (typeof multihash === 'string') {
    if (enc === 'base58' || !enc) {
      return multihash
    }
    return uint8ArrayFromString(multihash, enc)
  } else if (multihash instanceof Uint8Array) {
    return multihash
  } else if (CID.isCID(multihash)) {
    return multihash.bytes
  }
  throw new Error('unsupported multihash')
}

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  /**
   *
   * @param {CID} multihash
   * @param {GetOptions & AbortOptions} [options]
   */
  async function get (multihash, options = {}) { // eslint-disable-line require-await
    let mh, cid

    try {
      mh = normalizeMultihash(multihash, options.enc)
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_MULTIHASH')
    }

    try {
      cid = new CID(mh)
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }

    if (options.cidVersion === 1) {
      cid = cid.toV1()
    }

    if (options.preload !== false) {
      preload(cid)
    }

    return ipld.get(cid, { signal: options.signal })
  }

  return withTimeoutOption(get)
}

/**
 * @typedef {Object} GetOptions
 * @property {boolean} [preload]
 * @property {number} [cidVersion]
 * @property {BaseName | 'utf8' | 'utf-8' | 'ascii' | 'base58'} [enc]
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 */
