'use strict'

const exporter = require('ipfs-unixfs-exporter')
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
   * @type {import('ipfs-core-types/src/root').API["get"]}
   */
  async function * get (ipfsPath, options = {}) {
    if (options.preload !== false) {
      let pathComponents

      try {
        pathComponents = normalizeCidPath(ipfsPath).split('/')
      } catch (err) {
        throw errCode(err, 'ERR_INVALID_PATH')
      }

      preload(new CID(pathComponents[0]))
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
