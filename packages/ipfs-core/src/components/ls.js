'use strict'

const { exporter, recursive } = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizeCidPath, mapFile } = require('../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { CID } = require('multiformats/cid')

/**
 * @typedef {Object} Context
 * @property {import('ipfs-repo').IPFSRepo} repo
 * @property {import('../types').Preload} preload
 *
 * @param {Context} context
 */
module.exports = function ({ repo, preload }) {
  /**
   * @type {import('ipfs-core-types/src/root').API["ls"]}
   */
  async function * ls (ipfsPath, options = {}) {
    const legacyPath = normalizeCidPath(ipfsPath)
    const pathComponents = legacyPath.split('/')

    if (options.preload !== false) {
      preload(CID.parse(pathComponents[0]))
    }

    const ipfsPathOrCid = CID.asCID(legacyPath) || legacyPath

    const file = await exporter(ipfsPathOrCid, repo.blocks, options)

    if (file.type === 'file') {
      yield mapFile(file, options)
      return
    }

    if (file.type === 'directory') {
      if (options.recursive) {
        for await (const child of recursive(file.cid, repo.blocks, options)) {
          if (file.cid.toString() === child.cid.toString()) {
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
