'use strict'

const dagPB = require('ipld-dag-pb')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  const get = require('./get')({ ipld, preload })

  /**
   * @type {import('ipfs-core-types/src/object').API["stat"]}
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
