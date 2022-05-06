import mergeOpts from 'merge-options'
import { toMfsPath } from './utils/to-mfs-path.js'
import { exporter } from 'ipfs-unixfs-exporter'
import { logger } from '@libp2p/logger'
import errCode from 'err-code'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import * as dagPB from '@ipld/dag-pb'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })
const log = logger('ipfs:mfs:stat')

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
export function createStat (context) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["stat"]}
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
      file = await exporter(exportPath, context.repo.blocks)
    } catch (/** @type {any} */ err) {
      if (err.code === 'ERR_NOT_FOUND') {
        throw errCode(new Error(`${path} does not exist`), 'ERR_NOT_FOUND')
      }

      throw err
    }

    if (!statters[file.type]) {
      throw new Error(`Cannot stat codec ${file.cid.code}`)
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
      cumulativeSize: dagPB.encode(file.node).length + (file.node.Links || []).reduce((acc, curr) => acc + (curr.Tsize || 0), 0),
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
      cumulativeSize: dagPB.encode(file.node).length + (file.node.Links || []).reduce((acc, curr) => acc + (curr.Tsize || 0), 0),
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
