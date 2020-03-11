'use strict'

const ndjson = require('iterable-ndjson')
const toIterable = require('stream-to-it/source')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async function * tail (options = {}) {
    const res = await api.post('log/tail', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    yield * ndjson(toIterable(res.body))
  }
}
