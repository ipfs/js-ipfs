'use strict'

const callbackify = require('callbackify')
const configure = require('../../lib/configure')

module.exports = configure(({ ky }) => {
  return callbackify.variadic(async (profile, options) => {
    options = options || {}

    const res = await ky.post('config/profile/apply', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: {
        arg: profile,
        // can only pass strings or numbers as values https://github.com/sindresorhus/ky/issues/182
        'dry-run': options.dryRun ? 'true' : 'false'
      }
    })

    const parsed = await res.json()

    return {
      original: parsed.OldCfg, updated: parsed.NewCfg
    }
  })
})
