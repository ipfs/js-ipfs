'use strict'

const toIterable = require('stream-to-it/source')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function * read (path, options = {}) {
    const res = await api.post('files/read', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        count: options.count || options.length,
        ...options
      }),
      headers: options.headers
    })

    yield * toIterable(res.body)
  }
})
