'use strict'

const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const { normalizeCidPath, mapFile, withTimeoutOption } = require('../utils')

/**
 * @typedef {import('ipfs-interface').CID} CID
 * @typedef {import('ipfs-unixfs').UnixFSTime}
 * @typedef {import('./init').PreloadService} Preload
 * @typedef {import('./init').Pin} Pin
 * @typedef {import('./init').IPLD} IPLD
 * @typedef {import('./init').GCLock} GCLock
 * @typedef {import('./init').Block} Block
 * @typedef {import('./init').ConstructorOptions} ConstructorOption
 */
/**
 * @typedef {Object} Context
 * @property {Preload} preload
 * @property {IPLD} ipld
 * @typedef {Object} GetOptions
 * @property {boolean} [preload]
 * @property {number} [offset] - An offset to start reading the file from
 * @property {number} [length] - An optional max length to read from the file
 * @property {number} [timeout] - A timeout in ms
 * @property {AbortSignal} [signal] - Can be used to cancel any long running requests started as a result of this call
 *
 * @typedef {Object} GetFile
 * @property {string} path
 * @property {AsyncIterable<Buffer>} content
 * @property {number} mode
 * @property {UnixFSTime} mtime
 *
 * @param {Context} context
 * @returns {Get}
 */
module.exports = function ({ ipld, preload }) {
  /**
   * @callback Get
   * @param {CID|string} ipfsPath
   * @param {GetOptions} options
   * @returns {AsyncIterable<GetFile>}
   * @type {Get}
   */
  async function * get (ipfsPath, options) {
    options = options || {}

    if (options.preload !== false) {
      let pathComponents

      try {
        pathComponents = normalizeCidPath(ipfsPath).split('/')
      } catch (err) {
        throw errCode(err, 'ERR_INVALID_PATH')
      }

      preload(pathComponents[0])
    }

    for await (const file of exporter.recursive(ipfsPath, ipld, options)) {
      // @ts-ignore - mapFile isn't guaranteed to have content
      yield mapFile(file, {
        ...options,
        includeContent: true
      })
    }
  }

  return withTimeoutOption(get)
}
