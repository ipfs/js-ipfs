'use strict'

const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await (await api.post('repo/version', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })).json()

    return res.Version
  }
})
