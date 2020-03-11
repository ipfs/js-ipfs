'use strict'

const toCamel = require('./lib/object-to-camel')

/** @typedef { import("./lib/api") } API */

module.exports = (/** @type {API} */ api) => {
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
}
