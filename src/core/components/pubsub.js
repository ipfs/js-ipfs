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
          self.libp2p.pubsub.subscribe(topic, options, handler, (err) => {
            if (err) {
              return reject(err)
            }
            resolve()
          })
        })
      }

      self.libp2p.pubsub.subscribe(topic, options, handler, callback)
    },

    unsubscribe: (topic, handler, callback) => {
      if (!self._options.EXPERIMENTAL.pubsub) {
        return callback
          ? setImmediate(() => callback(errPubsubDisabled()))
          : Promise.reject(errPubsubDisabled())
      }

      self.libp2p.pubsub.unsubscribe(topic, handler)

      if (!callback) {
        return Promise.resolve()
      }

      setImmediate(() => callback())
    },

    publish: promisify((topic, data, callback) => {
      if (!self._options.EXPERIMENTAL.pubsub) {
        return setImmediate(() => callback(errPubsubDisabled()))
      }
      self.libp2p.pubsub.publish(topic, data, callback)
    }),

    ls: promisify((callback) => {
      if (!self._options.EXPERIMENTAL.pubsub) {
        return setImmediate(() => callback(errPubsubDisabled()))
      }
      self.libp2p.pubsub.ls(callback)
    }),

    peers: promisify((topic, callback) => {
      if (!self._options.EXPERIMENTAL.pubsub) {
        return setImmediate(() => callback(errPubsubDisabled()))
      }
      self.libp2p.pubsub.peers(topic, callback)
    }),

    setMaxListeners (n) {
      if (!self._options.EXPERIMENTAL.pubsub) {
        throw errPubsubDisabled()
      }
      self.libp2p.pubsub.setMaxListeners(n)
    }
  }
}
