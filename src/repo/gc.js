'use strict'

const promisify = require('promisify-es6')
const streamToValueWithTransformer = require('../utils/stream-to-value-with-transformer')
const CID = require('cids')

const transform = function (res, callback) {
  callback(null, res.map(r => ({
    err: r.Err ? new Error(r.Err) : null,
    cid: (r.Key || {})['/'] ? new CID(r.Key['/']) : null
  })))
}

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    const request = {
      path: 'repo/gc',
      qs: opts
    }
    send(request, (err, result) => {
      if (err) {
        return callback(err)
      }

      streamToValueWithTransformer(result, transform, callback)
    })
  })
}
