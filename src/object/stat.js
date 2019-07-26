'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')

module.exports = (send) => {
  return promisify((cid, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    if (!opts) {
      opts = {}
    }

    try {
      cid = new CID(cid)
    } catch (err) {
      return callback(err)
    }

    send({
      path: 'object/stat',
      args: cid.toString(),
      qs: opts
    }, callback)
  })
}
