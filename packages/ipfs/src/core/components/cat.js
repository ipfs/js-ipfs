'use strict'

const exporter = require('ipfs-unixfs-exporter')
const { normalizeCidPath, withTimeoutOption } = require('../utils')

/**
 * @typedef {import('ipfs-interface').CID} CID
 * @typedef {import('./init').PreloadService} Preload
 * @typedef {import('./init').IPLD} IPLD
 */
/**
 * @typedef {Object} Context
 * @property {Preload} preload
 * @property {IPLD} ipld
 * @typedef {Object} CatOptions
 * @property {boolean} [preload]
 * @property {number} [offset] - An offset to start reading the file from
 * @property {number} [length] - An optional max length to read from the file
 * @property {number} [timeout] - A timeout in ms
 * @property {AbortSignal} [signal] - Can be used to cancel any long running requests started as a result of this call
 *
 * @param {Context} context
 * @returns {Cat}
 */
module.exports = function ({ ipld, preload }) {
  /**
   * @callback Cat
   * @param {string|CID} ipfsPath
   * @param {CatOptions} [options]
   * @returns {AsyncIterable<Buffer>}
   *
   * @type {Cat}
   */
  async function * cat (ipfsPath, options) {
    options = options || {}

    ipfsPath = normalizeCidPath(ipfsPath)

    if (options.preload !== false) {
      const pathComponents = ipfsPath.split('/')
      preload(pathComponents[0])
    }

    const file = await exporter(ipfsPath, ipld, options)

    // File may not have unixfs prop if small & imported with rawLeaves true
    if (file.unixfs && file.unixfs.type.includes('dir')) {
      throw new Error('this dag node is a directory')
    }

    if (!file.content) {
      throw new Error('this dag node has no content')
    }

    // @ts-ignore - TS can tell it's not dir without matching on .type
    yield * file.content(options)
  }

  return withTimeoutOption(cat)
}
