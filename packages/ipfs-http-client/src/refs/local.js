'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async function * refsLocal (options = {}) {
    const res = await api.post('refs/local', {
      timeout: options.timeout,
      signal: options.signal,
      transform: toCamel
    })

    yield * res.ndjson()
  }
})
