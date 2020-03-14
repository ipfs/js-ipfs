'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (path, options = {}) => {
    const res = await api.post('files/mkdir', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(path, options)
    })

    await res.text()
  }
})
