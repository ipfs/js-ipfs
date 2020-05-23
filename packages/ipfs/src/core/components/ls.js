'use strict'

const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizeCidPath, mapFile, withTimeoutOption } = require('../utils')

/**
 * @typedef {import("ipfs-interface").IPLDService} IPLDService
 * @typedef {import("ipfs-interface").PreloadService} PreloadService
 * @typedef {import("../utils").WithTimeoutOptions} WithTimeoutOptions
 * @typedef {import("ipfs-unixfs-exporter").UnixFSEntry} UnixFSEntry
 * @typedef {import("ipfs-unixfs-exporter").UnixFSDirectory} UnixFSDirectory
 * @typedef {import("cids")} CID
 */

/**
 * @param {Object} config
 * @param {IPLDService} config.ipld
 * @param {PreloadService} config.preload
 * @returns {LS}
 */
module.exports = function ({ ipld, preload }) {
  /**
   * @typedef {(ExtraLSOptions & WithTimeoutOptions)} LSOptions
   * @typedef {Object} ExtraLSOptions
   * @property {boolean} [recursive]
   * @property {boolean} [preload]
   * @property {boolean} [includeContent]
   */

  /**
   * @callback LS
   * @param {CID} ipfsPath
   * @param {LSOptions} [options]
   * @returns {AsyncIterable<*>}
   * @type {LS}
   */
  async function * ls (ipfsPath, options) {
    options = options || {}

    const path = normalizeCidPath(ipfsPath)
    const recursive = options.recursive
    const pathComponents = path.split('/')

    if (options.preload !== false) {
      preload(pathComponents[0])
    }

    const entry = await exporter(ipfsPath, ipld, options)
    const file = entry.unixfs == null ? null : /** @type {UnixFSEntry} */(entry)

    if (!file) {
      throw errCode(new Error('dag node was not a UnixFS node'), 'ERR_NOT_UNIXFS')
    }

    if (file.unixfs.type === 'file') {
      return mapFile(file, options)
    }

    if (file.unixfs.type.includes('dir')) {
      // TS can't refine type with a check above. We could instead either
      // type === 'directory' || type === 'hamt-sharded-directory'
      // or add something like `function isDir(UnixFSEntry) is UnixFSDirectory`.
      const dir = /** @type {UnixFSDirectory} */(file)

      if (recursive) {
        for await (const child of exporter.recursive(dir.cid, ipld, options)) {
          if (dir.cid.toBaseEncodedString() === child.cid.toBaseEncodedString()) {
            continue
          }

          yield mapFile(child, options)
        }

        return
      }

      for await (const entry of dir.content()) {
        const child = mapFile(entry, options)
        child.depth--

        yield child
      }

      return
    }

    throw errCode(new Error(`Unknown UnixFS type ${file.unixfs.type}`), 'ERR_UNKNOWN_UNIXFS_TYPE')
  }

  return withTimeoutOption(ls)
}
