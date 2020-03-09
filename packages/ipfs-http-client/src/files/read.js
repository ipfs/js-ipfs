'use strict'

const { Buffer } = require('buffer')
const configure = require('../lib/configure')
const toAsyncIterable = require('../lib/stream-to-async-iterable')

module.exports = configure(({ ky }) => {
  return async function * read (path, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.append('arg', `${path}`)
    if (options.length != null) searchParams.set('length', options.length)
    if (options.offset != null) searchParams.set('offset', options.offset)

    const res = await ky.post('files/read', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const chunk of toAsyncIterable(res)) {
      yield Buffer.from(chunk)
    }
  }
})
