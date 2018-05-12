'use strict'

const promisify = require('promisify-es6')
const setImmediate = require('async/setImmediate')

module.exports = function pubsub (self) {
  return {
    subscribe: (topic, handler, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (!callback) {
        return new Promise((resolve, reject) => {
          self._libp2pNode.pubsub.subscribe(topic, options, handler, (err) => {
            if (err) {
              return reject(err)
            }
            resolve()
          })
        })
      }

      self._libp2pNode.pubsub.subscribe(topic, options, handler, callback)
    },

    unsubscribe: (topic, handler, callback) => {
      self._libp2pNode.pubsub.unsubscribe(topic, handler)

      if (!callback) {
        return Promise.resolve()
      }

      setImmediate(() => callback())
    },

    publish: promisify((topic, data, callback) => {
      self._libp2pNode.pubsub.publish(topic, data, callback)
    }),

    ls: promisify((callback) => {
      self._libp2pNode.pubsub.ls(callback)
    }),

    peers: promisify((topic, callback) => {
      self._libp2pNode.pubsub.peers(topic, callback)
    }),

    setMaxListeners (n) {
      self._libp2pNode.pubsub.setMaxListeners(n)
    }
  }
}
