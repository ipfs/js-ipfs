'use strict'

const CID = require('cids')
const toCamelWithMetadata = require('../lib/object-to-camel-with-metadata')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function * ls (path, options = {}) {
    if (typeof path !== 'string') {
      options = path || {}
      path = '/'
    }

    const res = await api.ndjson('files/ls', {
      method: 'POST',
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(
        CID.isCID(path) ? `/ipfs/${path}` : path, {
          ...options,

          // TODO the args below are not in the go-ipfs or interface core
          stream: options.stream == null ? true : options.stream,
          long: options.long == null ? true : options.long,

          // TODO: remove after go-ipfs 0.5 is released
          l: options.long == null ? true : options.long
        }
      )
    })

    for await (const result of res) {
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
