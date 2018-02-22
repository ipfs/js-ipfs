'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const promisify = require('promisify-es6')
const CID = require('cids')
const waterfall = require('async/waterfall')
const block = require('../block')

module.exports = (send) => {
  return promisify((cid, path, options, callback) => {
    if (typeof path === 'function') {
      callback = path
      path = undefined
    }

    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = options || {}
    path = path || ''

    if (CID.isCID(cid)) {
      cid = cid.toBaseEncodedString()
    }

    waterfall([
      cb => {
        send({
          path: 'dag/resolve',
          args: cid + '/' + path,
          qs: options
        }, cb)
      },
      (resolved, cb) => {
        block(send).get(new CID(resolved['Cid']['/']), (err, ipfsBlock) => {
          cb(err, ipfsBlock, resolved['RemPath'])
        })
      },
      (ipfsBlock, path, cb) => {
        if (ipfsBlock.cid.codec === 'dag-cbor') {
          dagCBOR.resolver.resolve(ipfsBlock.data, path, cb)
        }
        if (ipfsBlock.cid.codec === 'dag-pb') {
          dagPB.resolver.resolve(ipfsBlock.data, path, cb)
        }
      }
    ], callback)
  })
}
