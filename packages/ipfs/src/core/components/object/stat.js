'use strict'

const dagPB = require('ipld-dag-pb')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipld-dag-pb').DAGNode} DAGNode
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 * @typedef {Object} Context
 * @property {import('../init').IPLD} ipld
 * @property {import('../init').PreloadService} preload
 *
 * @typedef {Object} StatOptions
 * @property {string} [enc]
 * @property {number} [cidVersion]
 * @property {boolean} [preload]
 *
 * @typedef {WithTimeoutOptions & StatOptions} Options
 *
 * @typedef {Object} Info
 * @property {string} Hash
 * @property {number} NumLinks
 * @property {number} BlockSize
 * @property {number} LinksSize
 * @property {number} DataSize
 * @property {number} CumulativeSize
 */

/**
 * @param {Context} context
 * @returns {Stat}
 **/
module.exports = ({ ipld, preload }) => {
  const get = require('./get')({ ipld, preload })
  /**
   * @callback Stat
   * @param {CID} multihash
   * @param {Options} [options]
   * @returns {Promise<Info>}
   * @type {Stat}
   */
  async function stat (multihash, options) {
    options = options || {}

    const node = await get(multihash, options)
    const serialized = dagPB.util.serialize(node)
    const cid = await dagPB.util.cid(serialized, {
      cidVersion: 0
    })

    const blockSize = serialized.length
    const linkLength = node.Links.reduce((a, l) => a + l.Tsize, 0)

    return {
      Hash: cid.toBaseEncodedString(),
      NumLinks: node.Links.length,
      BlockSize: blockSize,
      LinksSize: blockSize - node.Data.length,
      DataSize: node.Data.length,
      CumulativeSize: blockSize + linkLength
    }
  }

  return withTimeoutOption(stat)
}
