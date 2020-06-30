'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
const toMfsPath = require('./utils/to-mfs-path')
const exporter = require('ipfs-unixfs-exporter')
const log = require('debug')('ipfs:mfs:stat')
const errCode = require('err-code')
const { withTimeoutOption } = require('../../utils')

const defaultOptions = {
  withLocal: false,
  signal: undefined
}

module.exports = (context) => {
  return withTimeoutOption(async function mfsStat (path, options) {
    options = applyDefaultOptions(options, defaultOptions)

    log(`Fetching stats for ${path}`)

    const {
      type,
      cid,
      mfsPath
    } = await toMfsPath(context, path, options)

    const exportPath = type === 'ipfs' && cid ? cid : mfsPath
    let file

    try {
      file = await exporter(exportPath, context.ipld)
    } catch (err) {
      if (err.code === 'ERR_NOT_FOUND') {
        throw errCode(new Error(`${path} does not exist`), 'ERR_NOT_FOUND')
      }

      throw err
    }

    if (!statters[file.cid.codec]) {
      throw new Error(`Cannot stat codec ${file.cid.codec}`)
    }

    return statters[file.cid.codec](file, options)
  })
}

const statters = {
  raw: (file) => {
    return {
      cid: file.cid,
      size: file.node.length,
      cumulativeSize: file.node.length,
      blocks: 0,
      type: 'file', // for go compatibility
      local: undefined,
      sizeLocal: undefined,
      withLocality: false
    }
  },
  'dag-pb': (file) => {
    const blocks = file.node.Links.length
    const size = file.node.size
    const cumulativeSize = file.node.size

    const output = {
      cid: file.cid,
      size: size,
      cumulativeSize: cumulativeSize,
      blocks: blocks,
      local: undefined,
      sizeLocal: undefined,
      withLocality: false
    }

    if (file.unixfs) {
      output.size = file.unixfs.fileSize()

      // for go-ipfs compatibility
      if (file.unixfs.type === 'hamt-sharded-directory') {
        output.type = 'directory'
      } else {
        output.type = file.unixfs.type
      }

      output.mode = file.unixfs.mode

      if (file.unixfs.isDirectory()) {
        output.size = 0
        output.cumulativeSize = file.node.size
      }

      if (output.type === 'file') {
        output.blocks = file.unixfs.blockSizes.length
      }

      if (file.unixfs.mtime) {
        output.mtime = file.unixfs.mtime
      }
    }

    return output
  },
  'dag-cbor': (file) => {
    return {
      cid: file.cid,
      local: undefined,
      sizeLocal: undefined,
      withLocality: false
    }
  },
  identity: (file) => {
    return {
      cid: file.cid,
      size: file.node.digest.length,
      cumulativeSize: file.node.digest.length,
      blocks: 0,
      type: 'file', // for go compatibility
      local: undefined,
      sizeLocal: undefined,
      withLocality: false
    }
  }
}
