'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('key/list', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options.searchParams
    })
    const data = await res.json()

    return (data.Keys || []).map(k => toCamel(k))
  }
})
