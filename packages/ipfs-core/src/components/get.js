'use strict'

const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizeCidPath, mapFile } = require('../utils')
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
   * Fetch a file or an entire directory tree from IPFS that is addressed by a
   * valid IPFS Path.
   *
   * @param {import('ipfs-core-types/src/root').IPFSPath} ipfsPath
   * @param {import('ipfs-core-types/src/root').GetOptions} [options]
   * @returns {AsyncIterable<import('ipfs-core-types/src/files').IPFSEntry>}
   */
  async function * get (ipfsPath, options = {}) {
    if (options.preload !== false) {
      let pathComponents

      try {
        pathComponents = normalizeCidPath(ipfsPath).split('/')
      } catch (err) {
        throw errCode(err, 'ERR_INVALID_PATH')
      }

      preload(pathComponents[0])
    }

    for await (const file of exporter.recursive(ipfsPath, ipld, options)) {
      yield mapFile(file, {
        ...options,
        includeContent: true
      })
    }
  }

  return withTimeoutOption(get)
}
