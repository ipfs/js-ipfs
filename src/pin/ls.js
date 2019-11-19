'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (path, options) => {
    if (path && path.type) {
      options = path
      path = null
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (path) searchParams.set('arg', `${path}`)
    if (options.type) searchParams.set('type', options.type)

    const { Keys } = await ky.get('pin/ls', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return Object.keys(Keys).map(hash => ({ hash, type: Keys[hash].Type }))
  }
})
