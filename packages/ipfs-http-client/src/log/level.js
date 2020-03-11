'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (subsystem, level, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.append('arg', subsystem)
    searchParams.append('arg', level)

    const res = await api.post('log/level', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    return toCamel(await res.json())
  }
})
