'use strict'

const callbackify = require('callbackify')
const configure = require('../../lib/configure')
const toCamel = require('../../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return callbackify.variadic(async (options) => {
    options = options || {}

    const res = await ky.get('config/profile/list', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers
    })

    const parsed = await res.json()

    return parsed
      .map(profile => toCamel(profile))
  })
})
