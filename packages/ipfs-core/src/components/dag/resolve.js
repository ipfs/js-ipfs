'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')
const { resolvePath } = require('../../utils')

/**
 * @param {Object} config
 * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ repo, codecs, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/dag').API["resolve"]}
   */
  async function dagResolve (ipfsPath, options = {}) {
    const {
      cid
    } = toCidAndPath(ipfsPath)

    if (options.preload !== false) {
      preload(cid)
    }

    return resolvePath(repo, codecs, ipfsPath, options)
  }

  return withTimeoutOption(dagResolve)
}
