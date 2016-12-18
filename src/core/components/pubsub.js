'use strict'

const promisify = require('promisify-es6')
const Readable = require('stream').Readable

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function pubsub (self) {
  return {
    subscribe: promisify((topic, options, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (self._pubsub.subscriptions.has(topic)) {
        return callback(`Error: Already subscribed to '${topic}'`)
      }

      try {
        self._pubsub.subscribe(topic)
      } catch (err) {
        return callback(err)
      }

      const subscription = new Readable({ objectMode: true })
      let canceled = false
      subscription._read = () => {}

      // Attach an extra `cancel` method to the stream
      subscription.cancel = promisify((cb) => {
        canceled = true
        self._pubsub.unsubscribe(topic)
        self._pubsub.removeListener(topic, handler)
        subscription.on('end', cb)
        subscription.resume() // make sure it is flowing before cancel
        subscription.push(null)
      })

      self._pubsub.on(topic, handler)

      function handler (data) {
        if (canceled) {
          return
        }
        subscription.push({
          data: data,
          topicIDs: [topic]
        })
      }

      // Add the request to the active subscriptions and return the stream
      setImmediate(() => callback(null, subscription))
    }),

    publish: promisify((topic, data, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      // TODO: Tests don't show that we actually expect this, @haad??
      // data = Buffer.isBuffer(data) ? data : new Buffer(data)

      try {
        self._pubsub.publish(topic, data)
      } catch (err) {
        return callback(err)
      }

      setImmediate(() => callback())
    }),

    ls: promisify((callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      const subscriptions = Array.from(
        self._pubsub.subscriptions
      )

      setImmediate(() => callback(null, subscriptions))
    }),

    peers: promisify((topic, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      if (!self._pubsub.subscriptions.has(topic)) {
        return callback(`Error: Not subscribed to '${topic}'`)
      }

      let peers

      try {
        peers = Array.from(self._pubsub.peers.values())
          .filter((peer) => peer.topics.has(topic))
          .map((peer) => peer.info.id.toB58String())
      } catch (err) {
        return callback(err)
      }

      setImmediate(() => callback(null, peers))
    })
  }
}
