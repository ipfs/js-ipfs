import * as dagPB from '@ipld/dag-pb'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
export function createGet ({ repo, preload }) {
  /**
   * @type {import('ipfs-core-types/src/object').API<{}>["get"]}
   */
  async function get (cid, options = {}) { // eslint-disable-line require-await
    if (options.preload !== false) {
      preload(cid)
    }

    const block = await repo.blocks.get(cid, options)

    return dagPB.decode(block)
  }

  return withTimeoutOption(get)
}
