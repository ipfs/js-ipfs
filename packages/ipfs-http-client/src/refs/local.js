'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return function refsLocal (options = {}) {
    return api.ndjson('refs/local', {
      method: 'POST',
      timeout: options.timeout,
      signal: options.signal,
      transform: toCamel
    })
  }
})
