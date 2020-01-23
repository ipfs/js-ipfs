'use strict'

const CID = require('cids')
const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('stream-to-it/source')

module.exports = configure(({ ky }) => {
  return async function * gc (peerId, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.streamErrors) searchParams.set('stream-errors', options.streamErrors)

    const res = await ky.post('repo/gc', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const gcResult of ndjson(toIterable(res.body))) {
      yield {
        err: gcResult.Error ? new Error(gcResult.Error) : null,
        cid: (gcResult.Key || {})['/'] ? new CID(gcResult.Key['/']) : null
      }
    }
  }
})
