import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { createGet } from '../get.js'
import { createPut } from '../put.js'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../../types').Preload} config.preload
 */
export function createSetData ({ repo, preload }) {
  const get = createGet({ repo, preload })
  const put = createPut({ repo, preload })

  /**
   * @type {import('ipfs-core-types/src/object/patch').API<{}>["setData"]}
   */
  async function setData (cid, data, options = {}) {
    const node = await get(cid, options)

    return put({
      ...node,
      Data: data
    }, options)
  }

  return withTimeoutOption(setData)
}
