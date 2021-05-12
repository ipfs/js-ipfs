'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/dag').API["tree"]}
   */
  async function * tree (ipfsPath, options = {}) { // eslint-disable-line require-await
    const {
      cid,
      path
    } = toCidAndPath(ipfsPath)

    if (path) {
      options.path = path
    }

    if (options.preload !== false) {
      preload(cid)
    }

    yield * ipld.tree(cid, options.path, options)
  }

  return withTimeoutOption(tree)
}
