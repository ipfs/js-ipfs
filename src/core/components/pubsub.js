'use strict'

const promisify = require('promisify-es6')
const setImmediate = require('async/setImmediate')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function pubsub (self) {
  return {
    subscribe: (topic, options, handler, callback) => {
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      if (typeof options === 'function') {
        callback = handler
        handler = options
        options = {}
      }

      function subscribe (cb) {
        if (self._pubsub.listenerCount(topic) === 0) {
          self._pubsub.subscribe(topic)
        }

        self._pubsub.on(topic, handler)
        setImmediate(cb)
      }

      if (!callback) {
        return new Promise((resolve, reject) => {
          subscribe((err) => {
            if (err) {
              return reject(err)
            }
            resolve()
          })
        })
      } else {
        subscribe(callback)
      }
    },

    unsubscribe: (topic, handler) => {
      self._pubsub.removeListener(topic, handler)

      if (self._pubsub.listenerCount(topic) === 0) {
        self._pubsub.unsubscribe(topic)
      }
    },

    publish: promisify((topic, data, callback) => {
      if (!self.isOnline()) {
        return setImmediate(() => callback(new Error(OFFLINE_ERROR)))
      }

      if (!Buffer.isBuffer(data)) {
        return setImmediate(() => callback(new Error('data must be a Buffer')))
      }

      self._pubsub.publish(topic, data)
      setImmediate(() => callback())
    }),

    ls: promisify((callback) => {
      if (!self.isOnline()) {
        return setImmediate(() => callback(new Error(OFFLINE_ERROR)))
      }

      const subscriptions = Array.from(self._pubsub.subscriptions)

      setImmediate(() => callback(null, subscriptions))
    }),

    peers: promisify((topic, callback) => {
      if (!self.isOnline()) {
        return setImmediate(() => callback(new Error(OFFLINE_ERROR)))
      }

      if (typeof topic === 'function') {
        callback = topic
        topic = null
      }

      const peers = Array.from(self._pubsub.peers.values())
        .filter((peer) => topic ? peer.topics.has(topic) : true)
        .map((peer) => peer.info.id.toB58String())

      setImmediate(() => callback(null, peers))
    }),

    setMaxListeners (n) {
      return self._pubsub.setMaxListeners(n)
    }
  }
}
