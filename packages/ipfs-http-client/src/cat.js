'use strict'

const CID = require('cids')
const { Buffer } = require('buffer')
const configure = require('./lib/configure')
const toAsyncIterable = require('./lib/stream-to-async-iterable')

module.exports = configure(({ ky }) => {
  return async function * cat (path, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)

    if (typeof path === 'string') {
      searchParams.set('arg', path)
    } else {
      searchParams.set('arg', new CID(path).toString())
    }

    if (options.offset) searchParams.set('offset', options.offset)
    if (options.length) searchParams.set('length', options.length)

    const res = await ky.post('cat', {
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
