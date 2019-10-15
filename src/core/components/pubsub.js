'use strict'

const callbackify = require('callbackify')
const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const errcode = require('err-code')

module.exports = function pubsub (self) {
  function checkOnlineAndEnabled () {
    if (!self.isOnline()) {
      throw errcode(new Error(OFFLINE_ERROR), 'ERR_OFFLINE')
    }

    if (!self.libp2p.pubsub) {
      throw errcode(new Error('pubsub is not enabled'), 'ERR_PUBSUB_DISABLED')
    }
  }

  return {
    subscribe: (topic, handler, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (typeof callback === 'function') {
        try {
          checkOnlineAndEnabled()
        } catch (err) {
          return callback(err)
        }

        self.libp2p.pubsub.subscribe(topic, handler, options, callback)
        return
      }

      try {
        checkOnlineAndEnabled()
      } catch (err) {
        return Promise.reject(err)
      }

      return self.libp2p.pubsub.subscribe(topic, handler, options)
    },

    unsubscribe: (topic, handler, callback) => {
      if (typeof callback === 'function') {
        try {
          checkOnlineAndEnabled()
        } catch (err) {
          return callback(err)
        }

        self.libp2p.pubsub.unsubscribe(topic, handler, callback)
        return
      }

      try {
        checkOnlineAndEnabled()
      } catch (err) {
        return Promise.reject(err)
      }

      return self.libp2p.pubsub.unsubscribe(topic, handler)
    },

    publish: callbackify(async (topic, data) => { // eslint-disable-line require-await
      checkOnlineAndEnabled()

      await self.libp2p.pubsub.publish(topic, data)
    }),

    ls: callbackify(async () => { // eslint-disable-line require-await
      checkOnlineAndEnabled()

      return self.libp2p.pubsub.ls()
    }),

    peers: callbackify(async (topic) => { // eslint-disable-line require-await
      checkOnlineAndEnabled()

      return self.libp2p.pubsub.peers(topic)
    }),

    setMaxListeners (n) {
      checkOnlineAndEnabled()

      self.libp2p.pubsub.setMaxListeners(n)
    }
  }
}
