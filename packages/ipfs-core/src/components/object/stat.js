'use strict'

const dagPb = require('@ipld/dag-pb')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ repo, preload }) => {
  const get = require('./get')({ repo, preload })

  /**
   * @type {import('ipfs-core-types/src/object').API["stat"]}
   */
  async function stat (cid, options = {}) {
    const node = await get(cid, options)
    const serialized = dagPb.encode(node)
    const blockSize = serialized.length
    const linkLength = node.Links.reduce((a, l) => a + (l.Tsize || 0), 0)

    return {
      Hash: cid,
      NumLinks: node.Links.length,
      BlockSize: blockSize,
      LinksSize: blockSize - (node.Data || []).length,
      DataSize: (node.Data || []).length,
      CumulativeSize: blockSize + linkLength
    }
  }

  return withTimeoutOption(stat)
}
