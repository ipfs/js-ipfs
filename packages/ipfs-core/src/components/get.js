'use strict'

const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizeCidPath, mapFile } = require('../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Preload} config.preload
 */
module.exports = function ({ ipld, preload }) {
  /**
   * Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path.
   *
   * @param {CID|string} ipfsPath - An IPFS path or CID to export
   * @param {Options} [options]
   * @returns {AsyncIterable<IPFSEntry>}
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

/**
 * @typedef {GetOptions & AbortOptions} Options
 *
 * @typedef {Object} GetOptions
 * @property {boolean} [preload]
 *
 * @typedef {import('.').CID} CID
 * @typedef {import('../utils').AbortOptions} AbortOptions
 * @typedef {import('../utils').IPFSEntry} IPFSEntry
 */
