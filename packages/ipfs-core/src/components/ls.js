'use strict'

const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizeCidPath, mapFile, withTimeoutOption } = require('../utils')

module.exports = function ({ ipld, preload }) {
  return withTimeoutOption(async function * ls (ipfsPath, options) {
    options = options || {}

    const path = normalizeCidPath(ipfsPath)
    const recursive = options.recursive
    const pathComponents = path.split('/')

    if (options.preload !== false) {
      preload(pathComponents[0])
    }

    const file = await exporter(ipfsPath, ipld, options)

    if (!file.unixfs) {
      throw errCode(new Error('dag node was not a UnixFS node'), 'ERR_NOT_UNIXFS')
    }

    if (file.unixfs.type === 'file') {
      return mapFile(file, options)
    }

    if (file.unixfs.type.includes('dir')) {
      if (recursive) {
        for await (const child of exporter.recursive(file.cid, ipld, options)) {
          if (file.cid.toBaseEncodedString() === child.cid.toBaseEncodedString()) {
            continue
          }

          yield mapFile(child, options)
        }

        return
      }

      for await (let child of file.content()) {
        child = mapFile(child, options)
        child.depth--

        yield child
      }

      return
    }

    throw errCode(new Error(`Unknown UnixFS type ${file.unixfs.type}`), 'ERR_UNKNOWN_UNIXFS_TYPE')
  })
}
