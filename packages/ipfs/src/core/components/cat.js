'use strict'

const exporter = require('ipfs-unixfs-exporter')
const { normalizeCidPath, withTimeoutOption } = require('../utils')

module.exports = function ({ ipld, preload }) {
  return withTimeoutOption(async function * cat (ipfsPath, options) {
    options = options || {}

    ipfsPath = normalizeCidPath(ipfsPath)

    if (options.preload !== false) {
      const pathComponents = ipfsPath.split('/')
      preload(pathComponents[0])
    }

    const file = await exporter(ipfsPath, ipld, options)

    // File may not have unixfs prop if small & imported with rawLeaves true
    if (file.unixfs && file.unixfs.type.includes('dir')) {
      throw new Error('this dag node is a directory')
    }

    if (!file.content) {
      throw new Error('this dag node has no content')
    }

    yield * file.content(options)
  })
}
