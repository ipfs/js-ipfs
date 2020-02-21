'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toCamelWithMetadata = require('../lib/object-to-camel-with-metadata')

module.exports = configure(({ ky }) => {
  return async (path, options) => {
    if (typeof path !== 'string') {
      options = path
      path = '/'
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', path)
    if (options.cidBase) searchParams.set('cid-base', options.cidBase)
    if (options.hash != null) searchParams.set('hash', options.hash)
    if (options.size != null) searchParams.set('size', options.size)
    if (options.withLocal != null) searchParams.set('with-local', options.withLocal)

    const res = await ky.post('files/stat', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    res.WithLocality = res.WithLocality || false
    return toCoreInterface(toCamelWithMetadata(res))
  }
})

function toCoreInterface (entry) {
  entry.cid = new CID(entry.hash)
  delete entry.hash
  return entry
}
