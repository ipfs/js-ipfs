'use strict'

// const FloodSub = require('libp2p-floodsub')
const FloodSub = require('./../../../node_modules/libp2p-floodsub/src')
const promisify = require('promisify-es6')
const Stream = require('stream')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function floodsub (self) {
  let fsub

  return {
    start: promisify(() => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      fsub = new FloodSub(self._libp2pNode)
      return self._libp2pNode
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

      try {
        fsub.subscribe(topic)
      } catch (err) {
        return callback(err)
      }

      callback(null, rs)
    }),

    pub: promisify((topic, data, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      const buf = Buffer.isBuffer(data) ? data : new Buffer(data)

      try {
        fsub.publish(topic, buf)
      } catch (err) {
        return callback(err)
      }

      callback(null)
    })
  }
}
