'use strict'

const exporter = require('ipfs-unixfs-exporter')
const { normalizeCidPath } = require('../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Preload} config.preload
 */
module.exports = function ({ ipld, preload }) {
  /** @type {import('ipfs-interface/src/root').Cat} */
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
