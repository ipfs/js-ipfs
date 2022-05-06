import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { createGet } from '../get.js'
import { createPut } from '../put.js'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../../types').Preload} config.preload
 */
export function createAppendData ({ repo, preload }) {
  const get = createGet({ repo, preload })
  const put = createPut({ repo, preload })

  /**
   * @type {import('ipfs-core-types/src/object/patch').API<{}>["appendData"]}
   */
  async function appendData (cid, data, options = {}) {
    const node = await get(cid, options)
    const newData = uint8ArrayConcat([node.Data || [], data])

    return put({
      ...node,
      Data: newData
    }, options)
  }

  return withTimeoutOption(appendData)
}
