'use strict'

const Block = require('ipfs-block')
const CID = require('cids')
const multihash = require('multihashes')
const multipartRequest = require('../lib/multipart-request')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  async function put (data, options = {}) {
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

    let res
    try {
      const response = await api.post('block/put', {
        timeout: options.timeout,
        signal: options.signal,
        searchParams: toUrlSearchParams(options),
        ...(
          await multipartRequest(data, options.headers)
        )
      })
      res = await response.json()
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
