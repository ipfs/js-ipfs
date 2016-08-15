'use strict'

const isNode = require('detect-node')
const addToDagNodesTransform = require('../add-to-dagnode-transform')

module.exports = (send) => {
  return function add (path, opts, callback) {
    if (typeof (opts) === 'function' &&
        callback === undefined) {
      callback = opts
      opts = {}
    }

    if (!isNode) {
      return callback(new Error('Recursive uploads are not supported in the browser'))
    }

    if (typeof path !== 'string') {
      return callback(new Error('"path" must be a string'))
    }

    const sendWithTransform = send.withTransform(addToDagNodesTransform)

    return sendWithTransform({
      path: 'add',
      qs: opts,
      files: path
    }, callback)
  }
}
