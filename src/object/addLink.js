'use strict'

const promisify = require('promisify-es6')
const cleanMultihash = require('../utils/clean-multihash')

module.exports = (send) => {
  const objectGet = require('./get')(send)

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
      path: 'object/patch/add-link',
      args: [
        multihash,
        dLink.name,
        cleanMultihash(dLink.multihash)
      ]
    }, (err, result) => {
      if (err) {
        return callback(err)
      }
      objectGet(result.Hash, { enc: 'base58' }, callback)
    })
  })
}
