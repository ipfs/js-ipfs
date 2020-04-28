'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const multipartRequest = require('../../lib/multipart-request')
const configure = require('../../lib/configure')
const toUrlSearchParams = require('../../lib/to-url-search-params')

module.exports = configure(api => {
  return async (cid, data, options = {}) => {
    const { Hash } = await (await api.post('object/patch/set-data', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`
        ],
        ...options
      }),
      ...(
        await multipartRequest(data)
      )
    })).json()

    return new CID(Hash)
  }
})
