'use strict'

const toCamel = require('./lib/object-to-camel')
const configure = require('./lib/configure')

module.exports = configure(api => {
  return function ping (peerId, options = {}) {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', `${peerId}`)

    return api.ndjson('ping', {
      method: 'POST',
      timeout: options.timeout,
      signal: options.signal,
      searchParams,
      transform: toCamel
    })
  }
})
