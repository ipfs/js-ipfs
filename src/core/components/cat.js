'use strict'

const exporter = require('ipfs-unixfs-exporter')
const { normalizePath } = require('./utils')

module.exports = function (self) {
  return async function * catAsyncIterator (ipfsPath, options) {
    options = options || {}

    ipfsPath = normalizePath(ipfsPath)

    if (options.preload !== false) {
      const pathComponents = ipfsPath.split('/')
      self._preload(pathComponents[0])
    }

    const file = await exporter(ipfsPath, self._ipld, options)

    // File may not have unixfs prop if small & imported with rawLeaves true
    if (file.unixfs && file.unixfs.type.includes('dir')) {
      throw new Error('this dag node is a directory')
    }

    if (!file.content) {
      throw new Error('this dag node has no content')
    }

    yield * file.content(options)
  }
}
