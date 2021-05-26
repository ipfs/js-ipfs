'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/block').API<HTTPClientExtraOptions>} BlockAPI
 * @typedef {import('ipfs-core-types/src/block').RmResult} RmResult
 */

module.exports = configure(api => {
  /**
   * @type {BlockAPI["rm"]}
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

/**
 * @param {*} removed
 */
function toCoreInterface (removed) {
  /** @type {RmResult} */
  const out = {
    cid: new CID(removed.Hash)
  }

  if (removed.Error) {
    out.error = new Error(removed.Error)
  }

  return out
}
