'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
const toMfsPath = require('./utils/to-mfs-path')
const exporter = require('ipfs-unixfs-exporter')
const log = require('debug')('ipfs:mfs:stat')
const errCode = require('err-code')

const defaultOptions = {
  withLocal: false
}

module.exports = (context) => {
  return async function mfsStat (path, options) {
    options = applyDefaultOptions(options, defaultOptions)

    log(`Fetching stats for ${path}`)

    const {
      type,
      cid,
      mfsPath
    } = await toMfsPath(context, path)

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
  }
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
    let blocks = file.node.Links.length
    let size = file.node.size
    let cumulativeSize = file.node.size
    let nodeType = null

    if (file.unixfs) {
      size = file.unixfs.fileSize()
      nodeType = file.unixfs.type

      if (nodeType.includes('directory')) {
        size = 0
        cumulativeSize = file.node.size
      }

      if (nodeType === 'file') {
        blocks = file.unixfs.blockSizes.length
      }
    }

    return {
      cid: file.cid,
      size: size,
      cumulativeSize: cumulativeSize,
      blocks: blocks,
      type: nodeType,
      local: undefined,
      sizeLocal: undefined,
      withLocality: false
    }
  },
  'dag-cbor': (file) => {
    return {
      cid: file.cid,
      local: undefined,
      sizeLocal: undefined,
      withLocality: false
    }
  }
}
