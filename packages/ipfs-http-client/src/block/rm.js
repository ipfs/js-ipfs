'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('..').Implements<typeof import('ipfs-core/src/components/block/rm')>}
   */
  async function * rm (cid, options = {}) {
    if (!Array.isArray(cid)) {
      cid = [cid]
    }

    const res = await api.post('block/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.map(cid => new CID(cid).toString()),
        'stream-channels': true,
        ...options
      }),
      headers: options.headers
    })

    for await (const removed of res.ndjson()) {
      yield toCoreInterface(removed)
    }
  }

  return rm
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
