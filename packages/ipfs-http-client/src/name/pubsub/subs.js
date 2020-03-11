'use strict'

const configure = require('../../lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('name/pubsub/subs', {
      timeout: options.timeout,
      signal: options.signal
    })
    const data = await res.json()

    return data.Strings || []
  }
})
