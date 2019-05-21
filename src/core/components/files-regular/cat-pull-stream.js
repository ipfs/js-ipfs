'use strict'

const exporter = require('ipfs-unixfs-exporter')
const deferred = require('pull-defer')
const toPullStream = require('async-iterator-to-pull-stream')
const { normalizePath } = require('./utils')

module.exports = function (self) {
  return function catPullStream (ipfsPath, options) {
    if (typeof ipfsPath === 'function') {
      throw new Error('You must supply an ipfsPath')
    }

    options = options || {}

    ipfsPath = normalizePath(ipfsPath)
    const pathComponents = ipfsPath.split('/')

    if (options.preload !== false) {
      self._preload(pathComponents[0])
    }

    const d = deferred.source()

    exporter(ipfsPath, self._ipld, options)
      .then(file => {
        // File may not have unixfs prop if small & imported with rawLeaves true
        if (file.unixfs && file.unixfs.type.includes('dir')) {
          return d.abort(new Error('this dag node is a directory'))
        }

        if (!file.content) {
          return d.abort(new Error('this dag node has no content'))
        }

        d.resolve(toPullStream.source(file.content(options)))
      }, err => {
        d.abort(err)
      })

    return d
  }
}
