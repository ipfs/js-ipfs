'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipld-dag-pb').DAGNode} DAGNode
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 * @typedef {Object} Context
 * @property {import('../init').IPLD} ipld
 * @property {import('../init').PreloadService} preload
 */

/**
 * @param {Context} context
 * @returns {Data}
 **/
module.exports = ({ ipld, preload }) => {
  const get = require('./get')({ ipld, preload })
  /**
   * @callback Data
   * @param {CID} multihash
   * @param {WithTimeoutOptions} [options]
   * @returns {Promise<Buffer>}
   *
   * @type {Data}
   */
  async function data (multihash, options) {
    const node = await get(multihash, options)
    return node.Data
  }

  return withTimeoutOption(data)
}
