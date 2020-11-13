'use strict'

const Block = require('ipld-block')
const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('..').Implements<typeof import('ipfs-core/src/components/block/get')>}
   */
  async function get (cid, options = {}) {
    // @ts-ignore - CID|string seems to confuse typedef
    cid = new CID(cid)

    const res = await api.post('block/get', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })

    return new Block(new Uint8Array(await res.arrayBuffer()), cid)
  }
  return get
})
