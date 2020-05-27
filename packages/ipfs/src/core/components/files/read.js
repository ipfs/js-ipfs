'use strict'

const exporter = require('ipfs-unixfs-exporter')
const applyDefaultOptions = require('./utils/apply-default-options')
const toMfsPath = require('./utils/to-mfs-path')
const errCode = require('err-code')
const { withTimeoutOption } = require('../../utils')

const defaultOptions = {
  offset: 0,
  length: Infinity
}

/**
 * @typedef {import('./utils/to-mfs-path').PathInfo} PathInfo
 * @typedef {import('ipfs-unixfs-importer').InputTime} InputTime
  @typedef {import('ipfs-unixfs-exporter').UnixFSFile} UnixFSFile
 * @typedef {import('../init').IPLD} IPLD
 * @typedef {import('cids')} CID
 * @typedef {import('../init').IPFSRepo} Repo
 * @typedef {import('../index').Block} Block
 */
/**
 * @typedef {Object} Context
 * @property {IPLD} ipld
 * @property {Block} block
 * @property {Repo} repo
 *
 * @typedef {String|Buffer|AsyncIterable<Buffer>|Blob} Content
 *
 * @typedef {Object} ReadOptions
 * @property {number} [offset] - An offset to start writing to file at.
 * @property {number} [length] - How many bytes to write from the `content`.
 * @property {number} [timeout] - A timeout in ms
 * @property {AbortSignal} [signal] - Can be used to cancel any long running
 * requests started as a result of this call
 *
 * @param {Context} context
 * @returns {Read}
 */
module.exports = (context) => {
  /**
   * @callback Read
   * @param {string|CID} path
   * @param {ReadOptions} [options]
   * @returns {AsyncIterable<Buffer>}
   *
   * @type {Read}
   */
  function mfsRead (path, options = {}) {
    options = applyDefaultOptions(options, defaultOptions)

    return {
      /**
       * @returns {AsyncIterator<Buffer>}
       */
      [Symbol.asyncIterator]: async function * read () {
        const mfsPath = await toMfsPath(context, path)
        const entry = await exporter(mfsPath.mfsPath, context.ipld)

        // @ts-ignore may be non unixfs entry
        if (entry.unixfs.type !== 'file') {
          throw errCode(new Error(`${path} was not a file`), 'ERR_NOT_FILE')
        }

        /** @type {UnixFSFile} */
        const result = (entry)

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
