'use strict'

const configure = require('../lib/configure')

module.exports = configure(api => {
  return async function * tail (options = {}) {
    const res = await api.ndjson('log/tail', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    yield * res
  }
})
