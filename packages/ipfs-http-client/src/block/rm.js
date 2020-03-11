'use strict'

const CID = require('cids')
const merge = require('merge-options')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async function * rm (cid, options = {}) {
    if (!Array.isArray(cid)) {
      cid = [cid]
    }

    options = merge(
      options,
      {
        'stream-channels': true
      }
    )

    const searchParams = new URLSearchParams(options)

    cid.forEach(cid => {
      searchParams.append('arg', new CID(cid).toString())
    })

    const res = await api.ndjson('block/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: searchParams
    })

    for await (const removed of res) {
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
