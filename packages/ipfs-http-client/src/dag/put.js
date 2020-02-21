'use strict'

const dagCBOR = require('ipld-dag-cbor')
const CID = require('cids')
const multihash = require('multihashes')
const configure = require('../lib/configure')
const toFormData = require('../lib/buffer-to-form-data')

module.exports = configure(({ ky }) => {
  return async (dagNode, options) => {
    options = options || {}

    if (options.hash) {
      options.hashAlg = options.hash
      delete options.hash
    }

    if (options.cid && (options.format || options.hashAlg)) {
      throw new Error('Failed to put DAG node. Provide either `cid` OR `format` and `hashAlg` options')
    } else if ((options.format && !options.hashAlg) || (!options.format && options.hashAlg)) {
      throw new Error('Failed to put DAG node. Provide `format` AND `hashAlg` options')
    }

    if (options.cid) {
      const cid = new CID(options.cid)
      options = {
        ...options,
        format: cid.codec,
        hashAlg: multihash.decode(cid.multihash).name
      }
      delete options.cid
    }

    options = {
      format: 'dag-cbor',
      hashAlg: 'sha2-256',
      inputEnc: 'raw',
      ...options
    }

    let serialized

    if (options.format === 'dag-cbor') {
      serialized = dagCBOR.util.serialize(dagNode)
    } else if (options.format === 'dag-pb') {
      serialized = dagNode.serialize()
    } else {
      // FIXME Hopefully already serialized...can we use IPLD to serialise instead?
      serialized = dagNode
    }

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('format', options.format)
    searchParams.set('hash', options.hashAlg)
    searchParams.set('input-enc', options.inputEnc)
    if (options.pin != null) searchParams.set('pin', options.pin)

    const res = await ky.post('dag/put', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams,
      body: toFormData(serialized)
    }).json()

    return new CID(res.Cid['/'])
  }
})
