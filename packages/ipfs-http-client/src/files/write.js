'use strict'

const normaliseInput = require('ipfs-utils/src/files/normalise-input')
const modeToString = require('../lib/mode-to-string')
const mtimeToObject = require('../lib/mtime-to-object')
const configure = require('../lib/configure')
const multipartRequest = require('../lib/multipart-request')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (path, input, options = {}) => {
    const { body, headers } = multipartRequest(normaliseInput({
      content: input,
      path: 'arg',
      mode: modeToString(options.mode),
      mtime: mtimeToObject(options.mtime)
    }))

    const res = await api.post('files/write', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(path, { ...options, streamChannels: true }),
      headers,
      body
    })

    await res.text()
  }
})
