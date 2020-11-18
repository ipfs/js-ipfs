'use strict'

const exporter = require('ipfs-unixfs-exporter')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const toMfsPath = require('./utils/to-mfs-path')
const errCode = require('err-code')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

const defaultOptions = {
  offset: 0,
  length: Infinity,
  signal: undefined
}

/**
 * @param {any} context
 */
module.exports = (context) => {
  /**
   * Read a file
   *
   * @param {string | CID} path - An MFS path, IPFS Path or CID to read
   * @param {ReadOptions & AbortOptions} [options]
   * @returns {AsyncIterable<Uint8Array>}
   * @example
   * ```js
   * const chunks = []
   *
   * for await (const chunk of ipfs.files.read('/hello-world')) {
   *   chunks.push(chunk)
   * }
   *
   * console.log(uint8ArrayConcat(chunks).toString())
   * // Hello, World!
   * ```
   */
  function mfsRead (path, options = {}) {
    options = mergeOptions(defaultOptions, options)

    return {
      [Symbol.asyncIterator]: async function * read () {
        const mfsPath = await toMfsPath(context, path, options)
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

  return withTimeoutOption(mfsRead)
}

/**
 * @typedef {Object} ReadOptions
 * @property {number} [offset] - An offset to start reading the file from
 * @property {number} [length] - An optional max length to read from the file
 *
 * @typedef {import('cids')} CID
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 */
