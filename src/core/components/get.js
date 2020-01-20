'use strict'

const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizePath, mapFile } = require('./utils')

module.exports = function (self) {
  return async function * getAsyncIterator (ipfsPath, options) {
    options = options || {}

    if (options.preload !== false) {
      let pathComponents

      try {
        pathComponents = normalizePath(ipfsPath).split('/')
      } catch (err) {
        throw errCode(err, 'ERR_INVALID_PATH')
      }

      self._preload(pathComponents[0])
    }

    for await (const file of exporter.recursive(ipfsPath, self._ipld, options)) {
      yield mapFile(file, {
        ...options,
        includeContent: true
      })
    }
  }
}
