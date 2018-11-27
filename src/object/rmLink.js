'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const cleanMultihash = require('../utils/clean-multihash')

module.exports = (send) => {
  return promisify((multihash, dLink, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    if (!opts) {
      opts = {}
    }

    try {
      multihash = cleanMultihash(multihash, opts)
    } catch (err) {
      return callback(err)
    }

    send({
      path: 'object/patch/rm-link',
      args: [
        multihash,
        dLink.name
      ]
    }, (err, result) => {
      if (err) {
        return callback(err)
      }
      callback(null, new CID(result.Hash))
    })
  })
}
