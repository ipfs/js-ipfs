'use strict'

const CID = require('cids')
const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('../lib/stream-to-iterable')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async function * removeBlock (cid, options) {
    options = options || {}

    if (!Array.isArray(cid)) {
      cid = [cid]
    }

    const searchParams = new URLSearchParams()
    searchParams.set('stream-channels', true)
    searchParams.set('force', options.force || false)
    searchParams.set('quiet', options.quiet || false)

    cid.forEach(cid => {
      searchParams.append('arg', new CID(cid).toString())
    })

    const res = await ky.post('block/rm', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const removed of ndjson(toIterable(res.body))) {
      yield toCamel(removed)
    }
  }
})
