'use strict'

const CID = require('cids')
const ndjson = require('iterable-ndjson')
const merge = require('merge-options')
const toIterable = require('stream-to-it/source')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
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

    const res = await api.post('block/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: searchParams
    })

    for await (const removed of ndjson(toIterable(res.body))) {
      yield toCoreInterface(removed)
    }
  }
}

function toCoreInterface (removed) {
  const out = {
    cid: new CID(removed.Hash)
  }

  if (removed.Error) {
    out.error = new Error(removed.Error)
  }

  return out
}
