'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (name, pem, password, options = {}) => {
    if (typeof password !== 'string') {
      options = password || {}
      password = null
    }

    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', name)
    searchParams.set('pem', pem)
    searchParams.set('password', password)

    const res = await api.post('key/import', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })
    const data = await res.json()

    return toCamel(data)
  }
})
