'use strict'

const toCamel = require('../../lib/object-to-camel')
const configure = require('../../lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('name/pubsub/state', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options.searchParams
    })

    return toCamel(await res.json())
  }
})
