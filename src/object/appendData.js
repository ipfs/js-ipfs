'use strict'

const promisify = require('promisify-es6')
const once = require('once')
const CID = require('cids')
const SendOneFile = require('../utils/send-one-file')

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'object/patch/append-data')

  return promisify((cid, data, opts, _callback) => {
    if (typeof opts === 'function') {
      _callback = opts
      opts = {}
    }
    const callback = once(_callback)
    if (!opts) {
      opts = {}
    }

    try {
      cid = new CID(cid)
    } catch (err) {
      return callback(err)
    }

    sendOneFile(data, { args: [cid.toString()] }, (err, result) => {
      if (err) {
        return callback(err)
      }

      callback(null, new CID(result.Hash))
    })
  })
}
