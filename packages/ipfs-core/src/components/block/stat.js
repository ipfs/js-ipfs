import { cleanCid } from './utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */

export function createStat ({ repo, preload }) {
  /**
   * @type {import('ipfs-core-types/src/block').API<{}>["stat"]}
   */
  async function stat (cid, options = {}) {
    cid = cleanCid(cid)

    if (options.preload !== false) {
      preload(cid)
    }

    const block = await repo.blocks.get(cid)

    return { cid, size: block.length }
  }

  return withTimeoutOption(stat)
}
