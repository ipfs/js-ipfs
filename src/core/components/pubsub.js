'use strict'

const promisify = require('promisify-es6')
const setImmediate = require('async/setImmediate')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function pubsub (self) {
  return {
    subscribe: (topic, options, handler, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      if (typeof options === 'function') {
        callback = handler
        handler = options
        options = {}
      }

      if (!callback) {
        return new Promise((resolve, reject) => {
          subscribe(topic, options, handler, (err) => {
            if (err) {
              return reject(err)
            }
            resolve()
          })
        })
      }

      subscribe(topic, options, handler, callback)
    },

    unsubscribe: (topic, handler) => {
      const ps = self._pubsub

      ps.removeListener(topic, handler)

      if (ps.listenerCount(topic) === 0) {
        ps.unsubscribe(topic)
      }
    },

    publish: promisify((topic, data, callback) => {
      if (!self.isOnline()) {
        return setImmediate(() => callback(OFFLINE_ERROR))
      }

      if (!Buffer.isBuffer(data)) {
        return setImmediate(() => callback(new Error('data must be a Buffer')))
      }

      self._pubsub.publish(topic, data)
      setImmediate(() => callback())
    }),

    ls: promisify((callback) => {
      if (!self.isOnline()) {
        return setImmediate(() => callback(OFFLINE_ERROR))
      }

      const subscriptions = Array.from(
        self._pubsub.subscriptions
      )

      setImmediate(() => callback(null, subscriptions))
    }),

    peers: promisify((topic, callback) => {
      if (!self.isOnline()) {
        return setImmediate(() => callback(OFFLINE_ERROR))
      }

      const peers = Array.from(self._pubsub.peers.values())
          .filter((peer) => peer.topics.has(topic))
          .map((peer) => peer.info.id.toB58String())

      setImmediate(() => callback(null, peers))
    }),

    setMaxListeners (n) {
      return self._pubsub.setMaxListeners(n)
    }
  }

  function subscribe (topic, options, handler, callback) {
    const ps = self._pubsub

    if (ps.listenerCount(topic) === 0) {
      ps.subscribe(topic)
    }

    ps.on(topic, handler)
    setImmediate(() => callback())
  }
}
