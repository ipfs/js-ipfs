'use strict'

const Block = require('ipfs-block')
const CID = require('cids')
const multihash = require('multihashes')
const configure = require('../lib/configure')
const toFormData = require('../lib/buffer-to-form-data')

module.exports = configure(({ ky }) => {
  async function put (data, options) {
    options = options || {}

    if (Block.isBlock(data)) {
      const { name, length } = multihash.decode(data.cid.multihash)
      options = {
        ...options,
        format: data.cid.codec,
        mhtype: name,
        mhlen: length,
        version: data.cid.version
      }
      data = data.data
    } else if (options.cid) {
      const cid = new CID(options.cid)
      const { name, length } = multihash.decode(cid.multihash)
      options = {
        ...options,
        format: cid.codec,
        mhtype: name,
        mhlen: length,
        version: cid.version
      }
      delete options.cid
    }

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.format) searchParams.set('format', options.format)
    if (options.mhtype) searchParams.set('mhtype', options.mhtype)
    if (options.mhlen) searchParams.set('mhlen', options.mhlen)
    if (options.pin != null) searchParams.set('pin', options.pin)
    if (options.version != null) searchParams.set('version', options.version)

    let res
    try {
      res = await ky.post('block/put', {
        timeout: options.timeout,
        signal: options.signal,
        headers: options.headers,
        searchParams,
        body: toFormData(data)
      }).json()
    } catch (err) {
      // Retry with "protobuf"/"cbor" format for go-ipfs
      // TODO: remove when https://github.com/ipfs/go-cid/issues/75 resolved
      if (options.format === 'dag-pb') {
        return put(data, { ...options, format: 'protobuf' })
      } else if (options.format === 'dag-cbor') {
        return put(data, { ...options, format: 'cbor' })
      }

      throw err
    }

    return new Block(data, new CID(res.Key))
  }

  return put
})
