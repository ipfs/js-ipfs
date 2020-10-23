'use strict'

const exporter = require('ipfs-unixfs-exporter')
const toMfsPath = require('./utils/to-mfs-path')
const {
  MFS_FILE_TYPES,
  withTimeoutOption
} = require('../../utils')

/**
 * @param {*} fsEntry
 * @returns {UnixFSEntry}
 */
const toOutput = (fsEntry) => {
  let type = 0
  let size = fsEntry.node.size || fsEntry.node.length
  let mode
  let mtime

  if (fsEntry.unixfs) {
    size = fsEntry.unixfs.fileSize()
    type = MFS_FILE_TYPES[fsEntry.unixfs.type]
    mode = fsEntry.unixfs.mode
    mtime = fsEntry.unixfs.mtime
  }

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

module.exports = (context) => {
  /**
   * List directories in the local mutable namespace
   *
   * @param {string} path
   * @param {AbortOptions} [options]
   * @returns {AsyncIterable<UnixFSEntry>}
   * @example
   *
   * ```js
   * for await (const file of ipfs.files.ls('/screenshots')) {
   *  console.log(file.name)
   * }
   * // 2018-01-22T18:08:46.775Z.png
   * // 2018-01-22T18:08:49.184Z.png
   * ```
   */
  async function * mfsLs (path, options = {}) {
    const mfsPath = await toMfsPath(context, path, options)
    const fsDir = await exporter(mfsPath.mfsPath, context.ipld)

    // single file/node
    if (!fsDir.unixfs || !fsDir.unixfs.type.includes('directory')) {
      yield toOutput(fsDir)

      return
    }

    // directory, perhaps sharded
    for await (const fsEntry of fsDir.content(options)) {
      yield toOutput(fsEntry)
    }
  }

  return withTimeoutOption(mfsLs)
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 *
 * @typedef {object} UnixTimeObj
 * @property {number} secs - the number of seconds since (positive) or before
 * (negative) the Unix Epoch began
 * @property {number} [nsecs] - the number of nanoseconds since the last full
 * second.
 *
 * @typedef {object} UnixFSEntry
 * @property {CID} cid
 * @property {number} [mode]
 * @property {UnixTimeObj} [mtime]
 * @property {number} size
 * @property {number} type
 */
