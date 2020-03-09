'use strict'

const configure = require('../lib/configure')
const ndjson = require('iterable-ndjson')
const toAsyncIterable = require('../lib/stream-to-async-iterable')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async function * refsLocal (options) {
    options = options || {}

    const res = await ky.post('refs/local', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers
    })

    for await (const file of ndjson(toAsyncIterable(res))) {
      yield toCamel(file)
    }
  }
})
