'use strict'

const exporter = require('ipfs-unixfs-exporter')
const applyDefaultOptions = require('./utils/apply-default-options')
const toMfsPath = require('./utils/to-mfs-path')
const errCode = require('err-code')

const defaultOptions = {
  offset: 0,
  length: Infinity
}

module.exports = (context) => {
  return function mfsRead (path, options = {}) {
    options = applyDefaultOptions(options, defaultOptions)

    return {
      [Symbol.asyncIterator]: async function * read () {
        const mfsPath = await toMfsPath(context, path)
        const result = await exporter(mfsPath.mfsPath, context.ipld)

        if (result.unixfs.type !== 'file') {
          throw errCode(new Error(`${path} was not a file`), 'ERR_NOT_FILE')
        }

        if (!result.content) {
          throw errCode(new Error(`Could not load content stream from ${path}`), 'ERR_NO_CONTENT')
        }

        for await (const buf of result.content({
          offset: options.offset,
          length: options.length
        })) {
          yield buf
        }
      }
    }
  }
}
