'use strict'

const { Buffer } = require('buffer')
const multipartRequest = require('../lib/multipart-request')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (config, options = {}) => {
    const res = await api.post('config/replace', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      ...(
        await multipartRequest(Buffer.from(JSON.stringify(config)), options.headers)
      )
    })

    return res.text()
  }
})
