'use strict'

const configure = require('../lib/configure')
const ndjson = require('iterable-ndjson')
const toIterable = require('stream-to-it/source')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async function * refsLocal (options) {
    options = options || {}

    const res = await ky.post('refs/local', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers
    })

    for await (const file of ndjson(toIterable(res.body))) {
      yield toCamel(file)
    }
  }
})
