'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (subsystem, level, options = {}) => {
    const res = await api.post('log/level', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          subsystem,
          level
        ],
        ...options
      }),
      headers: options.headers
    })

    return toCamel(await res.json())
  }
})
