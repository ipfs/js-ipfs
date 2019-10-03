'use strict'

const configure = require('../../lib/configure')
const callbackify = require('callbackify')
const toCamel = require('../../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return callbackify.variadic(async (options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('stream-channels', true)

    const res = await ky.get('config/profile/list', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    const parsed = await res.json()

    return parsed
      .map(profile => toCamel(profile))
  })
})
