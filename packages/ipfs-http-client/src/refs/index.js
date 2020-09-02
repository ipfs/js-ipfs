'use strict'

const CID = require('cids')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure((api, options) => {
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
  refs.local = require('./local')(options)

  return refs
})
