'use strict'

const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizeCidPath, mapFile } = require('../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { CID } = require('multiformats/cid')

/**
 * @typedef {Object} Context
 * @property {import('../block-storage')} blockStorage
 * @property {import('../types').Preload} preload
 *
 * @param {Context} context
 */
module.exports = function ({ blockStorage, preload }) {
  /**
   * @type {import('ipfs-core-types/src/root').API["get"]}
   */
  async function * get (legacyIpfsPath, options = {}) {
    if (options.preload !== false) {
      let pathComponents

      try {
        pathComponents = normalizeCidPath(legacyIpfsPath).split('/')
      } catch (err) {
        throw errCode(err, 'ERR_INVALID_PATH')
      }

      preload(new CID(pathComponents[0]))
    }

    // Make sure that the exporter doesn't get a legacy CID
    let ipfsPath
    if (CID.asCID(legacyIpfsPath) !== null) {
      ipfsPath = CID.asCID(legacyIpfsPath).bytes
    } else {
      ipfsPath = legacyIpfsPath
    }

    for await (const file of exporter.recursive(ipfsPath, blockStorage, options)) {
      yield mapFile(file, {
        ...options,
        includeContent: true
      })
    }
  }

  return withTimeoutOption(get)
}
