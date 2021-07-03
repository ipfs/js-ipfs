'use strict'

const dagPb = require('@ipld/dag-pb')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ repo, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/object').API["get"]}
   */
  async function get (cid, options = {}) { // eslint-disable-line require-await
    if (options.preload !== false) {
      preload(cid)
    }

    const block = await repo.blocks.get(cid, options)

    return dagPb.decode(block)
  }

  return withTimeoutOption(get)
}
