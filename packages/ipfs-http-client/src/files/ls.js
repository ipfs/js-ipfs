'use strict'

const CID = require('cids')
const ndjson = require('iterable-ndjson')
const toIterable = require('stream-to-it/source')
const configure = require('../lib/configure')
const toCamelWithMetadata = require('../lib/object-to-camel-with-metadata')

module.exports = configure(({ ky }) => {
  return async function * ls (path, options) {
    if (typeof path !== 'string') {
      options = path
      path = '/'
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', CID.isCID(path) ? `/ipfs/${path}` : path)
    searchParams.set('stream', options.stream == null ? true : options.stream)
    if (options.cidBase) searchParams.set('cid-base', options.cidBase)
    searchParams.set('long', options.long == null ? true : options.long)
    // TODO: remove after go-ipfs 0.5 is released
    searchParams.set('l', options.long == null ? true : options.long)

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
          yield toCoreInterface(toCamelWithMetadata(entry))
        }
      } else {
        yield toCoreInterface(toCamelWithMetadata(result))
      }
    }
  }
})

function toCoreInterface (entry) {
  if (entry.hash) entry.cid = new CID(entry.hash)
  delete entry.hash
  return entry
}
