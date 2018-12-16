'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')

module.exports = (send) => {
  return promisify((cid, dLink, opts, callback) => {
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
      path: 'object/patch/add-link',
      args: [
        cid.toString(),
        dLink.name,
        dLink.cid.toString()
      ]
    }, (err, result) => {
      if (err) {
        return callback(err)
      }
      callback(null, new CID(result.Hash))
    })
  })
}
