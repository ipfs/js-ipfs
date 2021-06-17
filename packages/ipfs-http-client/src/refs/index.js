'use strict'

const CID = require('cids')
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
    if (!Array.isArray(args)) {
      args = [args]
    }

    const res = await api.post('refs', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: args.map(arg => `${arg instanceof Uint8Array ? new CID(arg) : arg}`),
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
