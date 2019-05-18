'use strict'

const exporter = require('ipfs-unixfs-exporter')
const applyDefaultOptions = require('./utils/apply-default-options')
const toMfsPath = require('./utils/to-mfs-path')
const {
  FILE_SEPARATOR,
  FILE_TYPES
} = require('./utils/constants')

const defaultOptions = {

}

const toOutput = (fsEntry) => {
  let type = 0
  let size = fsEntry.node.size || fsEntry.node.length

  if (fsEntry.unixfs) {
    size = fsEntry.unixfs.fileSize()
    type = FILE_TYPES[fsEntry.unixfs.type]
  }

  return {
    cid: fsEntry.cid,
    name: fsEntry.name,
    type,
    size
  }
}

module.exports = (context) => {
  return async function * mfsLs (path = FILE_SEPARATOR, options = {}) {
    if (typeof path === 'object' && !(path instanceof String)) {
      options = path
      path = FILE_SEPARATOR
    }

    options = applyDefaultOptions(options, defaultOptions)

    const mfsPath = await toMfsPath(context, path)
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
}
