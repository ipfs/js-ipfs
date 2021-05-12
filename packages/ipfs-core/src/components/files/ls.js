'use strict'

const { exporter } = require('ipfs-unixfs-exporter')
const toMfsPath = require('./utils/to-mfs-path')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const map = require('it-map')

/**
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {import('ipfs-core-types/src/files').MFSEntry} MFSEntry
 */

/**
 * @param {import('ipfs-unixfs-exporter').UnixFSEntry} fsEntry
 */
const toOutput = (fsEntry) => {
  /** @type {MFSEntry} */
  const output = {
    cid: fsEntry.cid,
    name: fsEntry.name,
    type: fsEntry.type === 'directory' ? 'directory' : 'file',
    size: fsEntry.size
  }

  if (fsEntry.type === 'file' || fsEntry.type === 'directory') {
    output.mode = fsEntry.unixfs.mode
    output.mtime = fsEntry.unixfs.mtime
  }

  return output
}

/**
 * @param {MfsContext} context
 */
module.exports = (context) => {
  /**
   * @type {import('ipfs-core-types/src/files').API["ls"]}
   */
  async function * mfsLs (path, options = {}) {
    const mfsPath = await toMfsPath(context, path, options)
    const fsEntry = await exporter(mfsPath.mfsPath, context.ipld)

    // directory, perhaps sharded
    if (fsEntry.type === 'directory') {
      yield * map(fsEntry.content(options), toOutput)

      return
    }

    // single file/node
    yield toOutput(fsEntry)
  }

  return withTimeoutOption(mfsLs)
}
