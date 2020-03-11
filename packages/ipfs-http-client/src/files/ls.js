'use strict'

const CID = require('cids')
const ndjson = require('iterable-ndjson')
const toIterable = require('stream-to-it/source')
const toCamelWithMetadata = require('../lib/object-to-camel-with-metadata')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async function * ls (path, options = {}) {
    if (typeof path !== 'string') {
      options = path || {}
      path = '/'
    }

    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', CID.isCID(path) ? `/ipfs/${path}` : path)
    // TODO the args below are not in the go-ipfs or interface core
    searchParams.set('stream', options.stream == null ? true : options.stream)
    searchParams.set('long', options.long == null ? true : options.long)
    // TODO: remove after go-ipfs 0.5 is released
    searchParams.set('l', options.long == null ? true : options.long)

    const res = await api.post('files/ls', {
      timeout: options.timeout,
      signal: options.signal,
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
}

function toCoreInterface (entry) {
  if (entry.hash) entry.cid = new CID(entry.hash)
  delete entry.hash
  return entry
}
