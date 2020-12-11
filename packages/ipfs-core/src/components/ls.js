'use strict'

const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizeCidPath, mapFile } = require('../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('./root').IPLD} config.ipld
 * @param {import('./root').Preload} config.preload
 */
module.exports = function ({ ipld, preload }) {
  /**
   * Lists a directory from IPFS that is addressed by a valid IPFS Path.
   *
   * @param {string|CID} ipfsPath - An IPFS path or CID to list
   * @param {Options} options
   * @returns {AsyncIterable<LSEntry>}
   */
  async function * ls (ipfsPath, options = {}) {
    const path = normalizeCidPath(ipfsPath)
    const recursive = options.recursive
    const pathComponents = path.split('/')

    if (options.preload !== false) {
      preload(pathComponents[0])
    }

    const file = await exporter(ipfsPath, ipld, options)

    if (!file.unixfs) {
      throw errCode(new Error('dag node was not a UnixFS node'), 'ERR_NOT_UNIXFS')
    }

    if (file.unixfs.type === 'file') {
      yield mapFile(file, options)
      return
    }

    if (file.unixfs.type.includes('dir')) {
      if (recursive) {
        for await (const child of exporter.recursive(file.cid, ipld, options)) {
          if (file.cid.toBaseEncodedString() === child.cid.toBaseEncodedString()) {
            continue
          }

          yield mapFile(child, options)
        }

        return
      }

      for await (let child of file.content()) {
        child = mapFile(child, options)
        child.depth--

        yield child
      }

      return
    }

    throw errCode(new Error(`Unknown UnixFS type ${file.unixfs.type}`), 'ERR_UNKNOWN_UNIXFS_TYPE')
  }

  return withTimeoutOption(ls)
}

/**
 * @typedef {import('../utils').IPFSEntry} LSEntry
 *
 * @typedef {LSOptions & AbortOptions} Options
 *
 * @typedef {Object} LSOptions
 * @property {boolean} [recursive]
 * @property {boolean} [preload]
 * @property {boolean} [includeContent]
 *
 * @typedef {import('../utils').AbortOptions} AbortOptions
 *
 * @typedef {import('.').CID} CID
 */
