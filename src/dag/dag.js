'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const promisify = require('promisify-es6')
const CID = require('cids')
const multihash = require('multihashes')

function noop () {}

module.exports = (send) => {
  const api = {
    put: promisify((dagNode, options, callback) => {
      if (typeof options === 'function') {
        return setImmediate(() => callback(new Error('no options were passed')))
      }

      callback = callback || noop

      let hashAlg = options.hashAlg || 'sha2-256'
      let format
      let inputEnc

      if (options.cid && CID.isCID(options.cid)) {
        format = options.cid.codec
        hashAlg = multihash.decode(options.cid.multihash).name
        prepare()
      } else if (options.format) {
        format = options.format
        prepare()
      } else {
        callback(new Error('Invalid arguments'))
      }

      function prepare () {
        if (format === 'dag-cbor') {
          // TODO change this once
          // https://github.com/ipfs/go-ipfs/issues/3771 is finished
          format = 'cbor'

          inputEnc = 'cbor'
          dagCBOR.util.serialize(dagNode, finalize)
        }
        if (format === 'dag-pb') {
          // TODO change this once
          // https://github.com/ipfs/go-ipfs/issues/3771 is finished
          format = 'protobuf'

          inputEnc = 'protobuf'
          dagPB.util.serialize(dagNode, finalize)
        }
      }

      function finalize (err, serialized) {
        if (err) { return callback(err) }

        send({
          path: 'dag/put',
          qs: {
            hashAlg: hashAlg, // not implemented in go yet https://github.com/ipfs/go-ipfs/issues/3771
            format: format,
            inputenc: inputEnc
          },
          files: serialized
        }, (err, result) => {
          if (err) {
            return callback(err)
          }
          // TODO handle the result
        })
      }
    }),
    get: promisify((cid, path, options, callback) => {
      // TODO
    })
  }

  return api
}
