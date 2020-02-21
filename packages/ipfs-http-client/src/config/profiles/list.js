'use strict'

const configure = require('../../lib/configure')
const toCamel = require('../../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async (options) => {
    options = options || {}

    const res = await ky.post('config/profile/list', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    }).json()

    return res.map(profile => toCamel(profile))
  }
})
