'use strict'

const configure = require('../../lib/configure')

module.exports = configure(({ ky }) => {
  return async (name, options) => {
    options = options || {}

    const res = await ky.post('name/pubsub/subs', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    }).json()

    return res.Strings || []
  }
})
