'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
const toMfsPath = require('./utils/to-mfs-path')
const exporter = require('ipfs-unixfs-exporter')
const log = require('debug')('ipfs:mfs:stat')
const errCode = require('err-code')
const { withTimeoutOption } = require('../../utils')

const defaultOptions = {
  withLocal: false
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-unixfs-exporter').ExporterEntry} ExporterEntry
 * @typedef {import('ipfs-unixfs-exporter').UnixFSEntry} UnixFSEntry
 * @typedef {import('ipfs-unixfs-exporter').RawEntry} RawEntry
 * @typedef {import('ipfs-unixfs-exporter').CBOREntry} CBOREntry
 * @typedef {import('ipfs-unixfs').UnixFSTime} UnixFSTime
 * @typedef {import('../init').IPLD} IPLD
 * @typedef {import('../init').IPFSRepo} Repo
 * @typedef {import('../index').Block} Block
 */
/**
 * @typedef {Object} Context
 * @property {IPLD} ipld
 * @property {Block} block
 * @property {Repo} repo
 *
 * @typedef {Object} StatOptions
 * @property {boolean} [hash=false] - If true, return only the CID
 * @property {boolean} [size=false] - If true, return only the size
 * @property {boolean} [withLocal=false] - If true, compute the amount of the DAG that is local and if possible the total size
 * @property {number|string} [timeout] - A timeout in ms
 * @property {AbortSignal} [signal] - Can be used to cancel any long running requests started as a result of this call
 *
 * @param {Context} context
 * @returns {Stat}
*/
module.exports = (context) => {
  /**
   * @callback Stat
   * @param {string|CID} path
   * @param {StatOptions} [options]
   * @returns {Promise<EntryStat>}
   *
   * @type {Stat}
   */
  async function mfsStat (path, options) {
    options = applyDefaultOptions(options, defaultOptions)

    log(`Fetching stats for ${path}`)

    const {
      type,
      cid,
      mfsPath
    } = await toMfsPath(context, path)

    const exportPath = type === 'ipfs' && cid ? cid : mfsPath
    /** @type {ExporterEntry} */
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

    // @ts-ignore - statters take single arg
    return statters[file.cid.codec](file, options)
  }

  return withTimeoutOption(mfsStat)
}

/**
 * @typedef {Object} RawStat
 * @property {CID} cid
 * @property {number} size
 * @property {number} cumulativeSize
 * @property {number} blocks
 * @property {'file'} type
 * @property {void} local
 * @property {void} sizeLocal
 * @property {false} withLocality
 *
 * @typedef {Object} UnixFSStat
 * @property {CID} cid
 * @property {number} size
 * @property {number} cumulativeSize
 * @property {number} blocks
 * @property {'file'|'directory'} type
 * @property {void} local
 * @property {void} sizeLocal
 * @property {false} withLocality
 * @property {number} mode
 * @property {UnixFSTime|Date} mtime
 *
 * @typedef {Object} CBORStat
 * @property {CID} cid
 * @property {void} local
 * @property {void} sizeLocal
 * @property {boolean} withLocality
 *
 * @typedef {Object} OtherStat
 * @property {CID} cid
 * @property {number} size
 * @property {number} cumulativeSize
 * @property {number} blocks
 * @property {'file'} type
 * @property {void} local
 * @property {void} sizeLocal
 * @property {boolean} withLocality
 *
 * @typedef {RawStat|UnixFSStat|CBORStat|OtherStat} EntryStat
 */

/**
 * @type {Record<string, function(*):EntryStat>}
 */
const statters = {
  /**
   * @param {RawEntry} file
   * @returns {RawStat}
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
   * @param {UnixFSEntry} file
   * @returns {UnixFSStat}
   */
  'dag-pb': (file) => {
    const blocks = file.node.Links.length
    const size = file.node.size
    const cumulativeSize = file.node.size

    /** @type {UnixFSStat} */
    // @ts-ignore
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
        // @ts-ignore - blockSizes isn't known property
        output.blocks = file.unixfs.blockSizes.length
      }

      if (file.unixfs.mtime) {
        output.mtime = file.unixfs.mtime
      }
    }

    return output
  },
  /**
   * @param {CBOREntry} file
   * @returns {CBORStat}
   */
  'dag-cbor': (file) => {
    return {
      cid: file.cid,
      local: undefined,
      sizeLocal: undefined,
      withLocality: false
    }
  },
  /**
   * @param {*} file
   * @returns {OtherStat}
   */
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
