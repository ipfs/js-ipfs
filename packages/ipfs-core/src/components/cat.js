'use strict'

const exporter = require('ipfs-unixfs-exporter')
const { normalizeCidPath } = require('../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {Object} Context
 * @property {import('.').IPLD} ipld
 * @property {import('.').Preload} preload
 *
 * @param {Context} context
 */
module.exports = function ({ ipld, preload }) {
  /**
   * Returns content of the file addressed by a valid IPFS Path or CID.
   *
   * @param {import('ipfs-core-types/src/root').IPFSPath} ipfsPath
   * @param {import('ipfs-core-types/src/root').CatOptions} [options]
   * @returns {AsyncIterable<Uint8Array>}
   */
  async function * cat (ipfsPath, options = {}) {
    ipfsPath = normalizeCidPath(ipfsPath)

    if (options.preload !== false) {
      const pathComponents = ipfsPath.split('/')
      preload(pathComponents[0])
    }

    const file = await exporter(ipfsPath, ipld, options)

    // File may not have unixfs prop if small & imported with rawLeaves true
    if (file.unixfs && file.unixfs.type.includes('dir')) {
      throw new Error('this dag node is a directory')
    }

    if (!file.content) {
      throw new Error('this dag node has no content')
    }

    yield * file.content(options)
  }

  return withTimeoutOption(cat)
}
