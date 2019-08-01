'use strict'

const exporter = require('ipfs-unixfs-exporter')
const toPullStream = require('async-iterator-to-pull-stream')
const errCode = require('err-code')
const pull = require('pull-stream/pull')
const pullError = require('pull-stream/sources/error')
const map = require('pull-stream/throughs/map')
const { normalizePath, mapFile } = require('./utils')

module.exports = function (self) {
  return (ipfsPath, options) => {
    options = options || {}

    if (options.preload !== false) {
      let pathComponents

      try {
        pathComponents = normalizePath(ipfsPath).split('/')
      } catch (err) {
        return pullError(errCode(err, 'ERR_INVALID_PATH'))
      }

      self._preload(pathComponents[0])
    }

    return pull(
      toPullStream.source(exporter.recursive(ipfsPath, self._ipld, options)),
      map(mapFile({
        ...options,
        includeContent: true
      }))
    )
  }
}
