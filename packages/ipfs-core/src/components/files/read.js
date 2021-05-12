'use strict'

const { exporter } = require('ipfs-unixfs-exporter')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const toMfsPath = require('./utils/to-mfs-path')
const errCode = require('err-code')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {number} offset
 * @property {number} length
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
  offset: 0,
  length: Infinity
}

/**
 * @param {MfsContext} context
 */
module.exports = (context) => {
  /**
   * @type {import('ipfs-core-types/src/files').API["read"]}
   */
  function mfsRead (path, options = {}) {
    /** @type {DefaultOptions} */
    options = mergeOptions(defaultOptions, options)

    return {
      [Symbol.asyncIterator]: async function * read () {
        const mfsPath = await toMfsPath(context, path, options)
        const result = await exporter(mfsPath.mfsPath, context.ipld)

        if (result.type !== 'file') {
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

  return withTimeoutOption(mfsRead)
}
