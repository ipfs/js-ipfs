'use strict'

const configure = require('../lib/configure')
const modeToString = require('../lib/mode-to-string')

module.exports = configure(({ ky }) => {
  return function chmod (path, mode, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.append('arg', path)
    searchParams.append('mode', modeToString(mode))
    if (options.flush != null) searchParams.set('flush', options.flush)
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)
    if (options.parents != null) searchParams.set('parents', options.parents)

    return ky.post('files/chmod', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).text()
  }
})
