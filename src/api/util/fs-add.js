'use strict'

const isNode = require('detect-node')
const addToDagNodesTransform = require('./../../add-to-dagnode-transform')
const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((path, opts, callback) => {
    if (typeof opts === 'function' &&
        callback === undefined) {
      callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' &&
        typeof callback === 'function') {
      callback = opts
      opts = {}
    }

    if (!isNode) {
      return callback(new Error('fsAdd does not work in the browser'))
    }

    if (typeof path !== 'string') {
      return callback(new Error('"path" must be a string'))
    }

    const sendWithTransform = send.withTransform(addToDagNodesTransform)

    sendWithTransform({
      path: 'add',
      qs: opts,
      files: path
    }, callback)
  })
}
