import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { createGet } from '../get.js'
import { createPut } from '../put.js'

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../../types').Preload} config.preload
 */
export function createRmLink ({ repo, preload }) {
  const get = createGet({ repo, preload })
  const put = createPut({ repo, preload })

  /**
   * @type {import('ipfs-core-types/src/object/patch').API<{}>["rmLink"]}
   */
  async function rmLink (multihash, linkRef, options = {}) {
    const node = await get(multihash, options)
    const name = (typeof linkRef === 'string' ? linkRef : linkRef.Name) || ''

    node.Links = node.Links.filter(l => l.Name !== name)

    return put(node, options)
  }

  return withTimeoutOption(rmLink)
}
