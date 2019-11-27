'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (path, options) => {
    if (path && path.type) {
      options = path
      path = null
    }

    path = path || []
    path = Array.isArray(path) ? path : [path]
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    path.forEach(p => searchParams.append('arg', `${p}`))
    if (options.type) searchParams.set('type', options.type)

    const { Keys } = await ky.post('pin/ls', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return Object.keys(Keys).map(hash => ({ hash, type: Keys[hash].Type }))
  }
})
