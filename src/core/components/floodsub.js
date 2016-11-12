'use strict'

const FloodSub = require('libp2p-floodsub')
const promisify = require('promisify-es6')
const Stream = require('stream')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function floodsub (self) {
  let fsub

  return {
    start: promisify((libp2pNode) => {
      fsub = new FloodSub(libp2pNode)
    }),

    sub: promisify((topic, options, callback) => {
      // TODO: Clarify with @diasdavid what to do with the `options.discover` param
      // Ref: https://github.com/ipfs/js-ipfs-api/pull/377/files#diff-f0c61c06fd5dc36b6f760b7ea97b1862R50
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      let rs = new Stream()
      rs.readable = true
      rs._read = () => {}
      rs.cancel = () => fsub.unsubscribe(topic)

      fsub.on(topic, (data) => {
        rs.emit('data', {
          data: data.toString(),
          topicIDs: [topic]
        })
      })

      fsub.subscribe(topic)
      callback(null, rs)
    }),

    pub: promisify((topic, data, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      const buf = Buffer.isBuffer(data) ? data : new Buffer(data)

      fsub.publish(topic, data)
      callback(null)
    })
  }
}
