import * as dagPB from '@ipld/dag-pb'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { createGet } from './get.js'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
export function createStat ({ repo, preload }) {
  const get = createGet({ repo, preload })

  /**
   * @type {import('ipfs-core-types/src/object').API<{}>["stat"]}
   */
  async function stat (cid, options = {}) {
    const node = await get(cid, options)
    const serialized = dagPB.encode(node)
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
