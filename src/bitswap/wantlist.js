'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')

module.exports = (send) => {
  return promisify((peerId, opts, callback) => {
    if (typeof (peerId) === 'function') {
      callback = peerId
      opts = {}
      peerId = null
    } else if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    if (peerId) {
      try {
        opts.peer = new CID(peerId).toBaseEncodedString()
      } catch (err) {
        return callback(err)
      }
    }

    send({
      path: 'bitswap/wantlist',
      qs: opts
    }, callback)
  })
}
