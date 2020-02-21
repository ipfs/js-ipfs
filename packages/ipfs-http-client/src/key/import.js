'use strict'

const configure = require('../lib/configure')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async (name, pem, password, options) => {
    if (typeof password !== 'string') {
      options = password
      password = null
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', name)
    searchParams.set('pem', pem)
    if (password) searchParams.set('password', password)

    const res = await ky.post('key/import', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return toCamel(res)
  }
})
