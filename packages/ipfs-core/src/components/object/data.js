'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ repo, preload }) => {
  const get = require('./get')({ repo, preload })

  /**
   * @type {import('ipfs-core-types/src/object').API["data"]}
   */
  async function data (multihash, options = {}) {
    const node = await get(multihash, options)
    return node.Data || new Uint8Array(0)
  }

  return withTimeoutOption(data)
}
