'use strict'

const promisify = require('promisify-es6')

module.exports = function pubsub (self) {
  return {
    subscribe: (topic, options, handler, callback) => {
      if (typeof options === 'function') {
        callback = handler
        handler = options
        options = {}
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
      } else {
        self.libp2p.pubsub.subscribe(topic, options, handler, callback)
      }
    },

    unsubscribe: (topic, handler) => {
      self.libp2p.pubsub.unsubscribe(topic, handler)
    },

    publish: promisify((topic, data, callback) => {
      self.libp2p.pubsub.publish(topic, data, callback)
    }),

    ls: promisify((callback) => {
      self.libp2p.pubsub.ls(callback)
    }),

    peers: promisify((topic, callback) => {
      self.libp2p.pubsub.peers(topic, callback)
    }),

    setMaxListeners (n) {
      self.libp2p.pubsub.setMaxListeners(n)
    }
  }
}
