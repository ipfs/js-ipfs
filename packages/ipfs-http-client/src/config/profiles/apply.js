'use strict'

const configure = require('../../lib/configure')
const toUrlSearchParams = require('../../lib/to-url-search-params')

module.exports = configure(api => {
  return async (profile, options = {}) => {
    const res = await api.post('config/profile/apply', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: profile,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return {
      original: data.OldCfg, updated: data.NewCfg
    }
  }
})
