'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function chmod (path, mode, options = {}) {
    const res = await api.post('files/chmod', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(path, { ...options, mode })
    })

    await res.text()
  }
})
