'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function * refsLocal (options = {}) {
    const res = await api.post('refs/local', {
      timeout: options.timeout,
      signal: options.signal,
      transform: toCamel,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    yield * res.ndjson()
  }
})
