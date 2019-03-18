'use strict'

const exporter = require('ipfs-unixfs-exporter')
const pull = require('pull-stream')
const errCode = require('err-code')
const { normalizePath } = require('./utils')

module.exports = function (self) {
  return (ipfsPath, options) => {
    options = options || {}

    if (options.preload !== false) {
      let pathComponents

      try {
        pathComponents = normalizePath(ipfsPath).split('/')
      } catch (err) {
        return pull.error(errCode(err, 'ERR_INVALID_PATH'))
      }

      self._preload(pathComponents[0])
    }

    return pull(
      exporter(ipfsPath, self._ipld, options),
      pull.map(file => Object.assign(file, { hash: file.cid.toString() }))
    )
  }
}
