'use strict'

const exporter = require('ipfs-unixfs-exporter')
const pull = require('pull-stream')
const { normalizePath } = require('./utils')

module.exports = function (self) {
  return function (ipfsPath, options = {}) {
    const path = normalizePath(ipfsPath)
    const pathComponents = path.split('/')

    // eg QmHash/linkName => 2
    const pathDepth = pathComponents.length

    // The exporter returns a depth for each node, eg:
    // Qmhash.../linkName/linkName/linkName/block
    //    0         1         2        3      4
    if (options.maxDepth === undefined) {
      options.maxDepth = options.recursive ? global.Infinity : pathDepth
    } else {
      options.maxDepth = options.maxDepth + pathDepth - 1
    }

    if (options.preload !== false) {
      self._preload(pathComponents[0])
    }

    return pull(
      exporter(ipfsPath, self._ipld, options),
      pull.map(node => {
        node.hash = node.cid.toString()
        delete node.cid
        delete node.content
        return node
      })
    )
  }
}
