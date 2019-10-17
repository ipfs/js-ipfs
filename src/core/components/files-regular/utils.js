'use strict'

const CID = require('cids')
const { Buffer } = require('buffer')
const { cidToString } = require('../../../utils/cid')

const normalizePath = (path) => {
  if (Buffer.isBuffer(path)) {
    return new CID(path).toString()
  }
  if (CID.isCID(path)) {
    return path.toString()
  }
  if (path.indexOf('/ipfs/') === 0) {
    path = path.substring('/ipfs/'.length)
  }
  if (path.charAt(path.length - 1) === '/') {
    path = path.substring(0, path.length - 1)
  }
  return path
}

const mapFile = (file, options) => {
  options = options || {}

  let size = 0
  let type = 'dir'

  if (file.unixfs && file.unixfs.type === 'file') {
    size = file.unixfs.fileSize()
    type = 'file'
  }

  const output = {
    hash: cidToString(file.cid, { base: options.cidBase }),
    path: file.path,
    name: file.name,
    depth: file.path.split('/').length,
    size,
    type
  }

  if (options.includeContent && file.unixfs && file.unixfs.type === 'file') {
    output.content = file.content
  }

  return output
}

module.exports = {
  normalizePath,
  mapFile
}
