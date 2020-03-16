'use strict'

const { Buffer } = require('buffer')
const multipartRequest = require('../lib/multipart-request')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (config, options = {}) => {
    const res = await api.post('config/replace', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options,
      ...(
        await multipartRequest(Buffer.from(JSON.stringify(config)))
      )
    })

    return res.text()
  }
})
