'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  const get = require('./get')({ ipld, preload })

  /**
   * @param {import('.').CID} multihash
   * @param {GetOptions & AbortOptions} options
   * @returns {Promise<any>}
   */
  async function data (multihash, options) {
    const node = await get(multihash, options)
    return node.Data
  }

  return withTimeoutOption(data)
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('./get').GetOptions} GetOptions
 * @typedef {import('.').AbortOptions} AbortOptions
 */
