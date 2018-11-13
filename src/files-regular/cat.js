'use strict'

const promisify = require('promisify-es6')
const cleanCID = require('../utils/clean-cid')
const v = require('is-ipfs')
const bl = require('bl')

module.exports = (send) => {
  return promisify((hash, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    try {
      hash = cleanCID(hash)
    } catch (err) {
      if (!v.ipfsPath(hash)) {
        return callback(err)
      }
    }

    const query = {
      offset: opts.offset,
      length: opts.length
    }

    send({ path: 'cat', args: hash, buffer: opts.buffer, qs: query }, (err, stream) => {
      if (err) { return callback(err) }

      stream.pipe(bl((err, data) => {
        if (err) { return callback(err) }

        callback(null, data)
      }))
    })
  })
}
