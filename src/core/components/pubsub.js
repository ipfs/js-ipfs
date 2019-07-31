'use strict'

const promisify = require('promisify-es6')
const setImmediate = require('async/setImmediate')
const errCode = require('err-code')

const errPubsubDisabled = () => {
  return errCode(new Error('pubsub experiment is not enabled'), 'ERR_PUBSUB_DISABLED')
}

module.exports = function pubsub (self) {
  return {
    subscribe: (topic, handler, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (!self.libp2p.pubsub) {
        return callback
          ? setImmediate(() => callback(errPubsubDisabled()))
          : Promise.reject(errPubsubDisabled())
      }

      if (!callback) {
        return self.libp2p.pubsub.subscribe(topic, handler, options)
      }

      self.libp2p.pubsub.subscribe(topic, handler, options, callback)
    },

    unsubscribe: (topic, handler, callback) => {
      if (!self.libp2p.pubsub) {
        return callback
          ? setImmediate(() => callback(errPubsubDisabled()))
          : Promise.reject(errPubsubDisabled())
      }

      if (!callback) {
        return self.libp2p.pubsub.unsubscribe(topic, handler)
      }

      self.libp2p.pubsub.unsubscribe(topic, handler, callback)
    },

    publish: promisify((topic, data, callback) => {
      if (!self.libp2p.pubsub) {
        return setImmediate(() => callback(errPubsubDisabled()))
      }
      self.libp2p.pubsub.publish(topic, data, callback)
    }),

    ls: promisify((callback) => {
      if (!self.libp2p.pubsub) {
        return setImmediate(() => callback(errPubsubDisabled()))
      }
      self.libp2p.pubsub.ls(callback)
    }),

    peers: promisify((topic, callback) => {
      if (!self.libp2p.pubsub) {
        return setImmediate(() => callback(errPubsubDisabled()))
      }
      self.libp2p.pubsub.peers(topic, callback)
    }),

    setMaxListeners (n) {
      if (!self.libp2p.pubsub) {
        throw errPubsubDisabled()
      }
      self.libp2p.pubsub.setMaxListeners(n)
    }
  }
}
