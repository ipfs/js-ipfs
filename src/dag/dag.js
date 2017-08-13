'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const promisify = require('promisify-es6')
const CID = require('cids')
const multihash = require('multihashes')
const block = require('./block')

function noop () {}

module.exports = (send) => {
  const api = {
    put: promisify((dagNode, options, callback) => {
      if (typeof options === 'function') {
        return setImmediate(() => callback(new Error('no options were passed')))
      }

      callback = callback || noop

      let hashAlg = options.hash || 'sha2-256'
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
        inputEnc = 'raw'

        if (format === 'dag-cbor') {
          dagCBOR.util.serialize(dagNode, finalize)
        }
        if (format === 'dag-pb') {
          dagPB.util.serialize(dagNode, finalize)
        }
      }

      function finalize (err, serialized) {
        if (err) { return callback(err) }

        send({
          path: 'dag/put',
          qs: {
            hash: hashAlg,
            format: format,
            'input-enc': inputEnc
          },
          files: serialized
        }, (err, result) => {
          if (err) {
            return callback(err)
          }
          if (result.Cid) {
            return callback(null, new CID(result.Cid['/']))
          } else {
            return callback(result)
          }
        })
      }
    }),
    get: promisify((cid, path, options, callback) => {
      if (typeof path === 'function') {
        callback = path
        path = undefined
      }

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      if (CID.isCID(cid)) {
        cid = cid.toBaseEncodedString()
      }

      if (typeof cid === 'string') {
        const split = cid.split('/')
        cid = split[0]
        split.shift()

        if (split.length > 0) {
          path = split.join('/')
        } else {
          path = '/'
        }
      }

      send({
        path: 'dag/resolve',
        args: cid + '/' + path,
        qs: options
      }, (err, resolved) => {
        if (err) {
          return callback(err)
        }

        let resolvedCid = new CID(resolved['Cid']['/'])

        block(send).get(resolvedCid, (err, blk) => {
          if (err) {
            return callback(err)
          }

          if (resolvedCid.codec === 'dag-cbor') {
            dagCBOR.resolver.resolve(blk, resolved['RemPath'], callback)
          }
          if (resolvedCid.codec === 'dag-pb') {
            dagCBOR.resolver.resolve(blk, resolved['RemPath'], callback)
          }
        })
      })
    })
  }

  return api
}
