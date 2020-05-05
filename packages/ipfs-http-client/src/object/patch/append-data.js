'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const multipartRequest = require('../../lib/multipart-request')
const configure = require('../../lib/configure')
const toUrlSearchParams = require('../../lib/to-url-search-params')

module.exports = configure(api => {
  return async (cid, data, options = {}) => {
    const res = await api.post('object/patch/append-data', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`,
        ...options
      }),
      ...(
        await multipartRequest(data, options.headers)
      )
    })

    const { Hash } = await res.json()

    return new CID(Hash)
  }
})
