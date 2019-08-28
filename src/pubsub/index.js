'use strict'

const nodeify = require('promise-nodeify')

// This file is temporary and for compatibility with legacy usage
module.exports = (send, options) => {
  if (typeof send !== 'function') {
    options = send
  }

  const ls = require('./ls')(options)
  const peers = require('./peers')(options)
  const publish = require('./publish')(options)
  const subscribe = require('./subscribe')(options)
  const unsubscribe = require('./unsubscribe')(options)

  return {
    ls: (options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(ls(options), callback)
    },
    peers: (topic, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(peers(topic, options), callback)
    },
    publish: (topic, data, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(publish(topic, data, options), callback)
    },
    subscribe: (topic, handler, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(subscribe(topic, handler, options), callback)
    },
    unsubscribe: (topic, handler, callback) => {
      return nodeify(unsubscribe(topic, handler), callback)
    }
  }
}
