'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('../../types').Preload} config.preload
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
module.exports = ({ preload, repo }) => {
  /**
   * @type {import('ipfs-core-types/src/block').API["get"]}
   */
  async function get (cid, options = {}) { // eslint-disable-line require-await
    if (options.preload !== false) {
      preload(cid)
    }

    return repo.blocks.get(cid, options)
  }

  return withTimeoutOption(get)
}
