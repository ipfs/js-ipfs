'use strict'

const configure = require('../../lib/configure')

module.exports = configure(({ ky }) => {
  return async (profile, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', profile)
    if (options.dryRun != null) searchParams.set('dry-run', options.dryRun)

    const res = await ky.post('config/profile/apply', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return {
      original: res.OldCfg, updated: res.NewCfg
    }
  }
})
