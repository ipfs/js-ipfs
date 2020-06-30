'use strict'

const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizeCidPath, mapFile, withTimeoutOption } = require('../utils')

module.exports = function ({ ipld, preload }) {
  return withTimeoutOption(async function * get (ipfsPath, options) {
    options = options || {}

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
  })
}
