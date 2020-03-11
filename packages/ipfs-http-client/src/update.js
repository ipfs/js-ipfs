'use strict'

const configure = require('./lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    return (await api.post('update', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })).text()
  }
})
