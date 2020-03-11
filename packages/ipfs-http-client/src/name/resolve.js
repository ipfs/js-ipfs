'use strict'

const ndjson = require('iterable-ndjson')
const toIterable = require('stream-to-it/source')
/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async function * (path, options = {}) {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', path)
    searchParams.set('stream', options.stream || true)

    const res = await api.post('name/resolve', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    for await (const result of ndjson(toIterable(res.body))) {
      yield result.Path
    }
  }
}
