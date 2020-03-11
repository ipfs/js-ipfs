'use strict'

const configure = require('./lib/configure')

module.exports = configure(api => {
  return async (path, options = {}) => {
    options.arg = path
    const rsp = await api.post('resolve', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })
    const data = await rsp.json()
    return data.Path
  }
})
