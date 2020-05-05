'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (peer, options = {}) => {
    if (peer) {
      options.peer = typeof peer === 'string' ? peer : new CID(peer).toString()
    }

    const res = await (await api.post('bitswap/wantlist', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json()

    return (res.Keys || []).map(k => new CID(k['/']))
  }
})
