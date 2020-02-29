'use strict'

const normaliseInput = require('ipfs-utils/src/files/normalise-input')
const modeToString = require('../lib/mode-to-string')
const mtimeToObject = require('../lib/mtime-to-object')
const configure = require('../lib/configure')
const multipartRequest = require('../lib/multipart-request')

module.exports = configure(api => {
  return async (path, input, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', path)
    searchParams.set('stream-channels', 'true')
    searchParams.set('hash', options.hashAlg)
    searchParams.set('hashAlg', null)

    const { body, headers } = multipartRequest(normaliseInput({
      content: input,
      path: path,
      mode: modeToString(options.mode),
      mtime: mtimeToObject(options.mtime)
    }))

    const res = await api.post('files/write', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams,
      headers,
      body
    })

    return res.text()
  }
})
