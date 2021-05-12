'use strict'

const { exporter } = require('ipfs-unixfs-exporter')
const { normalizeCidPath } = require('../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const CID = require('cids')

/**
 * @typedef {Object} Context
 * @property {import('ipld')} ipld
 * @property {import('../types').Preload} preload
 *
 * @param {Context} context
 */
module.exports = function ({ ipld, preload }) {
  /**
   * @type {import('ipfs-core-types/src/root').API["cat"]}
   */
  async function * cat (ipfsPath, options = {}) {
    ipfsPath = normalizeCidPath(ipfsPath)

    if (options.preload !== false) {
      const pathComponents = ipfsPath.split('/')
      preload(new CID(pathComponents[0]))
    }

    const file = await exporter(ipfsPath, ipld, options)

    // File may not have unixfs prop if small & imported with rawLeaves true
    if (file.type === 'directory') {
      throw new Error('this dag node is a directory')
    }

    if (!file.content) {
      throw new Error('this dag node has no content')
    }

    yield * file.content(options)
  }

  return withTimeoutOption(cat)
}
