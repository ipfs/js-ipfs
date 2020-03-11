'use strict'

const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (path, options = {}) => {
    options.arg = path
    const res = await api.post('files/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    return res.text()
  }
})
