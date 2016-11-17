'use strict'

const FloodSub = require('libp2p-floodsub')
const promisify = require('promisify-es6')
const Readable = require('stream').Readable

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const FSUB_ERROR = new Error(`FloodSub is not started.`)

module.exports = function floodsub (self) {
  return {
    start: promisify((callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      self._floodsub = new FloodSub(self._libp2pNode)
      return callback(null, self._floodsub)
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

      if (!self._floodsub) {
        throw FSUB_ERROR
      }

      let rs = new Readable()
      rs.cancel = () => self._floodsub.subscribe(topic)

      self._floodsub.on(topic, (data) => {
        rs.emit('data', {
          data: data.toString(),
          topicIDs: [topic]
        })
      })

      try {
        self._floodsub.subscribe(topic)
      } catch (err) {
        return callback(err)
      }

      callback(null, rs)
    }),

    pub: promisify((topic, data, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      if (!self._floodsub) {
        throw FSUB_ERROR
      }

      const buf = Buffer.isBuffer(data) ? data : new Buffer(data)

      try {
        self._floodsub.publish(topic, buf)
      } catch (err) {
        return callback(err)
      }

      callback(null)
    }),

    unsub: promisify((topic, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      if (!self._floodsub) {
        throw FSUB_ERROR
      }

      try {
        self._floodsub.unsubscribe(topic)
      } catch (err) {
        return callback(err)
      }

      callback(null)
    })
  }
}
