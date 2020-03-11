'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const toFormData = require('../../lib/buffer-to-form-data')
const configure = require('../../lib/configure')

module.exports = configure(api => {
  return async (cid, data, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)

    const { Hash } = await (await api.post('object/patch/append-data', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams,
      body: toFormData(data)
    })).json()

    return new CID(Hash)
  }
})
