'use strict'

const CID = require('cids')
const ndjson = require('iterable-ndjson')
const toIterable = require('../lib/stream-to-iterable')
const configure = require('../lib/configure')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async function * ls (path, options) {
    if (typeof path !== 'string') {
      options = path
      path = '/'
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', CID.isCID(path) ? `/ipfs/${path}` : path)
    searchParams.set('stream', true)
    if (options.cidBase) searchParams.set('cid-base', options.cidBase)
    if (options.long != null) searchParams.set('long', options.long)

    const res = await ky.post('files/ls', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const result of ndjson(toIterable(res.body))) {
      // go-ipfs does not yet support the "stream" option
      if ('Entries' in result) {
        for (const entry of result.Entries || []) {
          yield toCamel(entry)
        }
        return
      }
      yield toCamel(result)
    }
  }
})
