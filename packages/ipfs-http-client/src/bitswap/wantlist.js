'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (peerId, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)

    if (peerId) {
      if (typeof peerId === 'string') {
        searchParams.set('peer', peerId)
      } else {
        searchParams.set('peer', new CID(peerId).toString())
      }
    }

    const res = await ky.post('bitswap/wantlist', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return (res.Keys || []).map(k => new CID(k['/']))
  }
})
