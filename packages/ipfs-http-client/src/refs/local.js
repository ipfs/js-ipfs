'use strict'

const toCamel = require('../lib/object-to-camel')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return function refsLocal (options = {}) {
    return api.ndjson('refs/local', {
      method: 'POST',
      timeout: options.timeout,
      signal: options.signal,
      transform: toCamel
    })
  }
}
