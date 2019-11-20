'use strict'

const configure = require('../lib/configure')
const toFormData = require('../lib/buffer-to-form-data')

module.exports = configure(({ ky }) => {
  return async (path, input, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', path)
    searchParams.set('stream-channels', true)
    if (options.cidVersion) searchParams.set('cid-version', options.cidVersion)
    if (options.create != null) searchParams.set('create', options.create)
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)
    if (options.length != null) searchParams.set('length', options.length)
    if (options.offset != null) searchParams.set('offset', options.offset)
    if (options.parents != null) searchParams.set('parents', options.parents)
    if (options.rawLeaves != null) searchParams.set('raw-leaves', options.rawLeaves)
    if (options.truncate != null) searchParams.set('truncate', options.truncate)

    const res = await ky.post('files/write', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams,
      body: toFormData(input) // TODO: support inputs other than buffer as per spec
    })

    return res.text()
  }
})
