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
  /**
   * Returns content of the file addressed by a valid IPFS Path or CID.
   *
   * @param {CID|string} ipfsPath - An IPFS path or CID to export
   * @param {Options} [options]
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

/**
 * @typedef {CatOptions & AbortOptions} Options
 *
 * @typedef {Object} CatOptions
 * @property {number} [offset] - An offset to start reading the file from
 * @property {number} [length] - An optional max length to read from the file
 * @property {boolean} [preload]
 *
 * @typedef {import('../utils').AbortOptions} AbortOptions
 *
 * @typedef {import('.').CID} CID
 */
