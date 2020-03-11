'use strict'

const dagCBOR = require('ipld-dag-cbor')
const CID = require('cids')
const multihash = require('multihashes')
const toFormData = require('../lib/buffer-to-form-data')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (dagNode, options = {}) => {
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

    // TODO normalize hash property name
    options.hash = options.hashAlg
    options.hashAlg = null
    const searchParams = new URLSearchParams(options)

    const rsp = await api.post('dag/put', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams,
      body: toFormData(serialized)
    })
    const data = await rsp.json()

    return new CID(data.Cid['/'])
  }
})
