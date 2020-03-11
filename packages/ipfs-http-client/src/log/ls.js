'use strict'

const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('log/ls', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options.searchParams
    })

    const data = await res.json()
    return data.Strings
  }
})
