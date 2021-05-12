'use strict'

const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const toMfsPath = require('./utils/to-mfs-path')
const { exporter } = require('ipfs-unixfs-exporter')
const log = require('debug')('ipfs:mfs:stat')
const errCode = require('err-code')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {boolean} withLocal
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
  withLocal: false
}

/**
 * @typedef {import('ipfs-core-types/src/files').StatResult} StatResult
 */

/**
 * @param {MfsContext} context
 */
module.exports = (context) => {
  /**
   * @type {import('ipfs-core-types/src/files').API["stat"]}
   */
  async function mfsStat (path, options = {}) {
    /** @type {DefaultOptions} */
    options = mergeOptions(defaultOptions, options)

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

    if (!statters[file.type]) {
      throw new Error(`Cannot stat codec ${file.cid.codec}`)
    }

    return statters[file.type](file)
  }

  return withTimeoutOption(mfsStat)
}

/** @type {Record<string, (file:any) => StatResult>} */
const statters = {
  /**
   * @param {import('ipfs-unixfs-exporter').RawNode} file
   */
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
  /**
   * @param {import('ipfs-unixfs-exporter').UnixFSFile} file
   */
  file: (file) => {
    /** @type {StatResult} */
    const stat = {
      cid: file.cid,
      type: 'file',
      size: file.unixfs.fileSize(),
      cumulativeSize: file.node.size,
      blocks: file.unixfs.blockSizes.length,
      local: undefined,
      sizeLocal: undefined,
      withLocality: false,
      mode: file.unixfs.mode
    }

    if (file.unixfs.mtime) {
      stat.mtime = file.unixfs.mtime
    }

    return stat
  },
  /**
   * @param {import('ipfs-unixfs-exporter').UnixFSDirectory} file
   */
  directory: (file) => {
    /** @type {StatResult} */
    const stat = {
      cid: file.cid,
      type: 'directory',
      size: 0,
      cumulativeSize: file.node.size,
      blocks: file.node.Links.length,
      local: undefined,
      sizeLocal: undefined,
      withLocality: false,
      mode: file.unixfs.mode
    }

    if (file.unixfs.mtime) {
      stat.mtime = file.unixfs.mtime
    }

    return stat
  },
  /**
   * @param {import('ipfs-unixfs-exporter').ObjectNode} file
   */
  object: (file) => {
    /** @type {StatResult} */
    return {
      cid: file.cid,
      size: file.node.length,
      cumulativeSize: file.node.length,
      type: 'file', // for go compatibility
      blocks: 0,
      local: undefined,
      sizeLocal: undefined,
      withLocality: false
    }
  },
  /**
   * @param {import('ipfs-unixfs-exporter').IdentityNode} file
   */
  identity: (file) => {
    /** @type {StatResult} */
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
  }
}
