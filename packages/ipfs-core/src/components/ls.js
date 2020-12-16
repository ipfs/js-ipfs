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
  /** @type {import('ipfs-interface/src/root').List} */
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
