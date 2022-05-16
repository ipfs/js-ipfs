import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { createGet } from '../get.js'
import { createPut } from '../put.js'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../../types').Preload} config.preload
 */
export function createAddLink ({ repo, preload }) {
  const get = createGet({ repo, preload })
  const put = createPut({ repo, preload })

  /**
   * @type {import('ipfs-core-types/src/object/patch').API<{}>["addLink"]}
   */
  async function addLink (cid, link, options = {}) {
    const node = await get(cid, options)

    return put({
      ...node,
      Links: node.Links.concat([link])
    }, options)
  }

  return withTimeoutOption(addLink)
}
