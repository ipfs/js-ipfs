'use strict'

const promisify = require('promisify-es6')
const Readable = require('stream').Readable
const _values = require('lodash.values')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function pubsub (self) {
  let subscriptions = {}

  const addSubscription = (topic, request, stream) => {
    subscriptions[topic] = { request: request, stream: stream }
  }

  const removeSubscription = promisify((topic, callback) => {
    if (!subscriptions[topic]) {
      return callback(new Error(`Not subscribed to ${topic}`))
    }

    subscriptions[topic].stream.emit('end')
    delete subscriptions[topic]

    if (callback) {
      callback(null)
    }
  })

  return {
    subscribe: promisify((topic, options, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (subscriptions[topic]) {
        return callback(`Error: Already subscribed to '${topic}'`)
      }

      const stream = new Readable({ objectMode: true })

      stream._read = () => {}

      // There is no explicit unsubscribe; subscriptions have a cancel event
      stream.cancel = promisify((cb) => {
        // Remove the event listener
        self._pubsub.removeAllListeners(topic)
        // Make sure floodsub knows we've unsubscribed
        self._pubsub.unsubscribe(topic)
        // Remove the subscription from pubsub's internal state
        removeSubscription(topic, cb)
      })

      self._pubsub.on(topic, (data) => {
        stream.emit('data', {
          data: data.toString(),
          topicIDs: [topic]
        })
      })

      try {
        self._pubsub.subscribe(topic)
      } catch (err) {
        return callback(err)
      }

      // Add the request to the active subscriptions and return the stream
      addSubscription(topic, null, stream)
      callback(null, stream)
    }),

    publish: promisify((topic, data, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      const buf = Buffer.isBuffer(data) ? data : new Buffer(data)

      try {
        self._pubsub.publish(topic, buf)
      } catch (err) {
        return callback(err)
      }

      callback(null)
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

      callback(null, subscriptions)
    }),

    peers: promisify((topic, callback) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      if (!subscriptions[topic]) {
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

      callback(null, peers)
    })
  }
}
