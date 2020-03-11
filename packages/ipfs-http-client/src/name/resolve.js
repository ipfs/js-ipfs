'use strict'

const configure = require('../lib/configure')

module.exports = configure(api => {
  return async function * (path, options = {}) {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', path)
    searchParams.set('stream', options.stream || true)

    const res = await api.ndjson('name/resolve', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    for await (const result of res) {
      yield result.Path
    }
  }
})
