'use strict'

const exporter = require('ipfs-unixfs-exporter')
const applyDefaultOptions = require('./utils/apply-default-options')
const toMfsPath = require('./utils/to-mfs-path')
const {
  MFS_FILE_TYPES,
  withTimeoutOption
} = require('../../utils')

const defaultOptions = {

}

/**
 * @typedef {import('ipfs-unixfs-exporter').ExporterEntry} ExporterEntry
 * @typedef {import('ipfs-unixfs-exporter').UnixFSDirectory} UnixFSDirectory
 * @typedef {import('ipfs-unixfs').DataType} DataType
 * @typedef {import('ipfs-unixfs').UnixFSTime} UnixFSTime
 */

/**
 * @typedef {Object} Output
 * @property {CID} cid
 * @property {string} name
 * @property {number} type
 * @property {number} size
 * @property {Date|UnixFSTime} [mtime]
 * @property {number} [mode]
 *
 * @param {ExporterEntry} fsEntry
 * @returns {Output}
 */
const toOutput = (fsEntry) => {
  let type = 0
  // @ts-ignore - length field is unknow
  let size = fsEntry.node.size || fsEntry.node.length
  let mode
  let mtime

  if (fsEntry.unixfs) {
    size = fsEntry.unixfs.fileSize()
    type = MFS_FILE_TYPES[fsEntry.unixfs.type]
    mode = fsEntry.unixfs.mode
    mtime = fsEntry.unixfs.mtime
  }

  /** @type {Output} */
  const output = {
    cid: fsEntry.cid,
    name: fsEntry.name,
    type,
    size
  }

  if (mtime !== undefined) {
    output.mtime = mtime
  }

  if (mode !== undefined) {
    output.mode = mode
  }

  return output
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('../init').IPLD} IPLD
 * @typedef {import('../init').Block} Block
 * @typedef {import('../init').IPFSRepo} Repo
 */
/**
 * @typedef {Object} Context
 * @property {IPLD} ipld
 * @property {Block} block
 * @property {Repo} repo
 */

/**
 * @typedef {Object} LSOptions
 * @property {number} [offset]
 * @property {number} [length]
 */

/**
 * @param {Context} context
 * @returns {LS}
 */
module.exports = (context) => {
  /**
   * @callback LS
   * @param {string} path
   * @param {LSOptions} [opts]
   * @returns {AsyncIterable<Output>}
   *
   * @type {LS}
   */
  async function * mfsLs (path = '/', opts = {}) {
    // @ts-ignore
    if (typeof path === 'object' && !(path instanceof String)) {
      opts = path
      path = '/'
    }

    const options = applyDefaultOptions(opts, defaultOptions)

    const mfsPath = await toMfsPath(context, path)
    const entry = await exporter(mfsPath.mfsPath, context.ipld)

    // single file/node
    if (!entry.unixfs || !entry.unixfs.type.includes('directory')) {
      yield toOutput(entry)

      return
    }

    /** @type {UnixFSDirectory} */
    const fsDir = (entry)
    // directory, perhaps sharded
    for await (const fsEntry of fsDir.content(options)) {
      yield toOutput(fsEntry)
    }
  }

  return withTimeoutOption(mfsLs)
}
