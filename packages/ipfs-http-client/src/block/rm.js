'use strict'

const CID = require('cids')
const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('stream-to-it/source')

module.exports = configure(({ ky }) => {
  return async function * rm (cid, options) {
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
      yield toCoreInterface(removed)
    }
  }
})

function toCoreInterface (removed) {
  const out = {
    cid: new CID(removed.Hash)
  }

  if (removed.Error) {
    out.error = new Error(removed.Error)
  }

  return out
}
