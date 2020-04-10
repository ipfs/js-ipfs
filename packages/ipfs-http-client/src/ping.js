'use strict'

const toCamel = require('./lib/object-to-camel')
const configure = require('./lib/configure')

module.exports = configure(api => {
  return async function * ping (peerId, options = {}) {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', `${peerId}`)

    const res = await api.post('ping', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams,
      transform: toCamel
    })

    yield * res.ndjson()
  }
})
