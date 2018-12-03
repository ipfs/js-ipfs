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

      if (!self._options.EXPERIMENTAL.pubsub) {
        return callback
          ? setImmediate(() => callback(errPubsubDisabled()))
          : Promise.reject(errPubsubDisabled())
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
      if (!self._options.EXPERIMENTAL.pubsub) {
        return callback
          ? setImmediate(() => callback(errPubsubDisabled()))
          : Promise.reject(errPubsubDisabled())
      }

      self._libp2pNode.pubsub.unsubscribe(topic, handler)

      if (!callback) {
        return Promise.resolve()
      }

      setImmediate(() => callback())
    },

    publish: promisify((topic, data, callback) => {
      if (!self._options.EXPERIMENTAL.pubsub) {
        return setImmediate(() => callback(errPubsubDisabled()))
      }
      self._libp2pNode.pubsub.publish(topic, data, callback)
    }),

    ls: promisify((callback) => {
      if (!self._options.EXPERIMENTAL.pubsub) {
        return setImmediate(() => callback(errPubsubDisabled()))
      }
      self._libp2pNode.pubsub.ls(callback)
    }),

    peers: promisify((topic, callback) => {
      if (!self._options.EXPERIMENTAL.pubsub) {
        return setImmediate(() => callback(errPubsubDisabled()))
      }
      self._libp2pNode.pubsub.peers(topic, callback)
    }),

    setMaxListeners (n) {
      if (!self._options.EXPERIMENTAL.pubsub) {
        throw errPubsubDisabled()
      }
      self._libp2pNode.pubsub.setMaxListeners(n)
    }
  }
}
