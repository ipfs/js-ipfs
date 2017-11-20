'use strict'

const promisify = require('promisify-es6')
const once = require('once')
const cleanMultihash = require('../utils/clean-multihash')
const SendOneFile = require('../utils/send-one-file')

module.exports = (send) => {
  const objectGet = require('./get')(send)
  const sendOneFile = SendOneFile(send, 'object/patch/append-data')

  return promisify((multihash, data, opts, _callback) => {
    if (typeof opts === 'function') {
      _callback = opts
      opts = {}
    }
    const callback = once(_callback)
    if (!opts) {
      opts = {}
    }

    try {
      multihash = cleanMultihash(multihash, opts)
    } catch (err) {
      return callback(err)
    }

    sendOneFile(data, { args: [multihash] }, (err, result) => {
      if (err) {
        return callback(err)
      }

      objectGet(result.Hash, { enc: 'base58' }, callback)
    })
  })
}
