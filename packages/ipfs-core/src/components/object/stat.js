'use strict'

const dagPB = require('ipld-dag-pb')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  const get = require('./get')({ ipld, preload })

  /**
   * Returns stats about an Object
   *
   * @param {CID} multihash
   * @param {StatOptions & AbortOptions} options
   * @returns {Promise<Stat>}
   */
  async function stat (multihash, options = {}) {
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
/**
 * @typedef {Object} Stat
 * @property {string} Hash
 * @property {number} NumLinks
 * @property {number} BlockSize
 * @property {number} LinksSize
 * @property {number} DataSize
 * @property {number} CumulativeSize
 *
 * @typedef {import('./get').GetOptions} StatOptions
 * @typedef {import('.').CID} CID
 * @typedef {import('.').AbortOptions} AbortOptions
 */
