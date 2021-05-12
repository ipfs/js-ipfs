'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  const get = require('./get')({ ipld, preload })

  /**
   * @type {import('ipfs-core-types/src/object').API["data"]}
   */
  async function data (multihash, options = {}) {
    const node = await get(multihash, options)
    return node.Data
  }

  return withTimeoutOption(data)
}
