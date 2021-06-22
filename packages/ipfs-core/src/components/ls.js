'use strict'

const { exporter, recursive } = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizeCidPath, mapFile } = require('../utils')
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
   * @type {import('ipfs-core-types/src/root').API["ls"]}
   */
  async function * ls (ipfsPath, options = {}) {
    const path = normalizeCidPath(ipfsPath)
    const pathComponents = path.split('/')

    if (options.preload !== false) {
      preload(new CID(pathComponents[0]))
    }

    const file = await exporter(ipfsPath, ipld, options)

    if (file.type === 'file') {
      yield mapFile(file, options)
      return
    }

    if (file.type === 'directory') {
      if (options.recursive) {
        for await (const child of recursive(file.cid, ipld, options)) {
          if (file.cid.toBaseEncodedString() === child.cid.toBaseEncodedString()) {
            continue
          }

          yield mapFile(child, options)
        }

        return
      }

      for await (const child of file.content()) {
        const entry = mapFile(child, options)
        entry.depth--

        yield entry
      }

      return
    }

    throw errCode(new Error(`Unknown UnixFS type ${file.type}`), 'ERR_UNKNOWN_UNIXFS_TYPE')
  }

  return withTimeoutOption(ls)
}
