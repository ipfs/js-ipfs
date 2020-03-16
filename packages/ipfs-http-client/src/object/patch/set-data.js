'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const multipartRequest = require('../../lib/multipart-request')
const configure = require('../../lib/configure')

module.exports = configure(api => {
  return async (cid, data, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)

    const { Hash } = await (await api.post('object/patch/set-data', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams,
      ...(
        await multipartRequest(data)
      )
    })).json()

    return new CID(Hash)
  }
})
