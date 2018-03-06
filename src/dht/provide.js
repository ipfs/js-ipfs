'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')

module.exports = (send) => {
  return promisify((cids, opts, callback) => {
    if (typeof opts === 'function' && !callback) {
      callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' && typeof callback === 'function') {
      callback = opts
      opts = {}
    }

    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    // Validate CID(s) and serialize
    try {
      cids = cids.map(cid => new CID(cid).toBaseEncodedString('base58btc'))
    } catch (err) {
      return callback(err)
    }

    send({
      path: 'dht/provide',
      args: cids,
      qs: opts
    }, callback)
  })
}
