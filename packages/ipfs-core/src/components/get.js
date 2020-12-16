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
  /** @type {import('ipfs-interface/src/root').Get} */
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
