'use strict'

const promisify = require('promisify-es6')
const Readable = require('stream').Readable
const _values = require('lodash.values')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function pubsub (self) {
  return {
    subscribe: promisify((topic, options, callback) => {
      if (!self.isOnline()) { throw OFFLINE_ERROR }

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (self._pubsub.getSubscriptions().indexOf(topic) > -1) {
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

      let subscriptions = []

      try {
        subscriptions = self._pubsub.getSubscriptions()
      } catch (err) {
        return callback(err)
      }

      setImmediate(() => callback(null, subscriptions))
    }),

    peers: promisify((topic, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      if (self._pubsub.getSubscriptions().indexOf(topic) < 0) {
        return callback(`Error: Not subscribed to '${topic}'`)
      }

      let peers = []

      try {
        // This part should be moved down to floodsub
        // Just return the list of peers
        const peerSet = self._pubsub.getPeerSet()
        _values(peerSet).forEach((peer) => {
          const idB58Str = peer.peerInfo.id.toB58String()
          const index = peer.topics.indexOf(topic)
          if (index > -1) {
            peers.push(idB58Str)
          }
        })
      } catch (err) {
        return callback(err)
      }

      setImmediate(() => callback(null, peers))
    })
  }
}
