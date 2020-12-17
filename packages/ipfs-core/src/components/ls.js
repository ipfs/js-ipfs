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
   * Lists a directory from IPFS that is addressed by a valid IPFS Path.
   *
   * @param {import('ipfs-core-types/src/root').IPFSPath} ipfsPath
   * @param {import('ipfs-core-types/src/root').ListOptions} [options]
   * @returns {AsyncIterable<import('ipfs-core-types/src/files').IPFSEntry>}
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
