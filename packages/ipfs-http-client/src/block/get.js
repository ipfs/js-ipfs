'use strict'

const Block = require('ipld-block')
const CID = require('cids')
const { Buffer } = require('buffer')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {import('../../../ipfs/src/core/components/block/get').BlockGet<import('..').HttpOptions>}
   */
  async function get (cid, options = {}) {
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

    return new Block(Buffer.from(await res.arrayBuffer()), cid)
  }
  return get
})
