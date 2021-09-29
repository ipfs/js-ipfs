import { CID } from 'multiformats/cid'
import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { createLocal } from './local.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/refs').API<HTTPClientExtraOptions>} RefsAPI
 */

export const createRefs = configure((api, opts) => {
  /**
   * @type {RefsAPI["refs"]}
   */
  const refs = async function * (args, options = {}) {
    /** @type {import('ipfs-core-types/src/utils').IPFSPath[]} */
    const argsArr = Array.isArray(args) ? args : [args]

    const res = await api.post('refs', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: argsArr.map(arg => `${arg instanceof Uint8Array ? CID.decode(arg) : arg}`),
        ...options
      }),
      headers: options.headers,
      transform: objectToCamel
    })

    yield * res.ndjson()
  }

  return Object.assign(refs, {
    local: createLocal(opts)
  })
})
