'use strict'

const dagCBOR = require('ipld-dag-cbor')
const promisify = require('promisify-es6')
const CID = require('cids')
const multihash = require('multihashes')
const SendOneFile = require('../utils/send-one-file')

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'dag/put')

  return promisify((dagNode, options, callback) => {
    if (typeof options === 'function') {
      callback = options
    }

    options = options || {}

    if (options.hash) {
      options.hashAlg = options.hash
      delete options.hash
    }

    if (options.cid && (options.format || options.hashAlg)) {
      return callback(new Error('Can\'t put dag node. Please provide either `cid` OR `format` and `hash` options.'))
    } else if ((options.format && !options.hashAlg) || (!options.format && options.hashAlg)) {
      return callback(new Error('Can\'t put dag node. Please provide `format` AND `hash` options.'))
    }

    if (options.cid) {
      let cid

      try {
        cid = new CID(options.cid)
      } catch (err) {
        return callback(err)
      }

      options.format = cid.codec
      options.hashAlg = multihash.decode(cid.multihash).name
      delete options.cid
    }

    const optionDefaults = {
      format: 'dag-cbor',
      hashAlg: 'sha2-256',
      inputEnc: 'raw'
    }

    options = Object.assign(optionDefaults, options)

    let serialized

    try {
      if (options.format === 'dag-cbor') {
        serialized = dagCBOR.util.serialize(dagNode)
      } else if (options.format === 'dag-pb') {
        serialized = dagNode.serialize()
      } else {
        // FIXME Hopefully already serialized...can we use IPLD to serialise instead?
        serialized = dagNode
      }
    } catch (err) {
      return callback(err)
    }

    const sendOptions = {
      qs: {
        hash: options.hashAlg,
        format: options.format,
        'input-enc': options.inputEnc
      }
    }

    sendOneFile(serialized, sendOptions, (err, result) => {
      if (err) {
        return callback(err)
      }
      if (result.Cid) {
        return callback(null, new CID(result.Cid['/']))
      } else {
        return callback(result)
      }
    })
  })
}
