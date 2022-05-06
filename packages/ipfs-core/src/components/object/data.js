import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { createGet } from './get.js'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
export function createData ({ repo, preload }) {
  const get = createGet({ repo, preload })

  /**
   * @type {import('ipfs-core-types/src/object').API<{}>["data"]}
   */
  async function data (multihash, options = {}) {
    const node = await get(multihash, options)
    return node.Data || new Uint8Array(0)
  }

  return withTimeoutOption(data)
}
