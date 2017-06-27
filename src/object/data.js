'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')
const cleanMultihash = require('../utils/clean-multihash')
const LRU = require('lru-cache')
const lruOptions = {
  max: 128
}

const cache = LRU(lruOptions)

module.exports = (send) => {
  return promisify((multihash, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    if (!options) {
      options = {}
    }

    try {
      multihash = cleanMultihash(multihash, options)
    } catch (err) {
      return callback(err)
    }

    const node = cache.get(multihash)

    if (node) {
      return callback(null, node.data)
    }

    send({
      path: 'object/data',
      args: multihash
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
