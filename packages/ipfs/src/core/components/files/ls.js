'use strict'

const exporter = require('ipfs-unixfs-exporter')
const toMfsPath = require('./utils/to-mfs-path')
const {
  MFS_FILE_TYPES,
  withTimeoutOption
} = require('../../utils')

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
  return withTimeoutOption(async function * mfsLs (path, options = {}) {
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
  })
}
