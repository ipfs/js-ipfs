'use strict'

const configure = require('../lib/configure')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async (name, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', name)

    const res = await ky.post('key/rm', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return toCamel(res.Keys[0])
  }
})
