'use strict'

const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('stream-to-it/source')

module.exports = configure(({ ky }) => {
  return async function * tail (options) {
    options = options || {}

    const res = await ky.post('log/tail', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    })

    yield * ndjson(toIterable(res.body))
  }
})
