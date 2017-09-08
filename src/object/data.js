'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')
const CID = require('cids')
const LRU = require('lru-cache')
const lruOptions = {
  max: 128
}

const cache = LRU(lruOptions)

module.exports = (send) => {
  return promisify((cid, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    if (!options) {
      options = {}
    }

    let cidB58Str

    try {
      cid = new CID(cid)
      cidB58Str = cid.toBaseEncodedString()
    } catch (err) {
      return callback(err)
    }

    const node = cache.get(cidB58Str)

    if (node) {
      return callback(null, node.data)
    }

    send({
      path: 'object/data',
      args: cidB58Str
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      if (typeof result.pipe === 'function') {
        streamToValue(result, callback)
      } else {
        callback(null, result)
      }
    })
  })
}
