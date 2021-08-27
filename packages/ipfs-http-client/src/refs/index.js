'use strict'

const { CID } = require('multiformats/cid')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/refs').API<HTTPClientExtraOptions>} RefsAPI
 */

module.exports = configure((api, opts) => {
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
      transform: toCamel
    })

    yield * res.ndjson()
  }

  return Object.assign(refs, {
    local: require('./local')(opts)
  })
})
