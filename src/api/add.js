'use strict'

const isStream = require('isstream')
const addToDagNodesTransform = require('../add-to-dagnode-transform')

module.exports = (send) => {
  return function add (files, opts, cb) {
    if (typeof (opts) === 'function' && cb === undefined) {
      cb = opts
      opts = {}
    }

    const good = Buffer.isBuffer(files) ||
               isStream.isReadable(files) ||
               Array.isArray(files)

    if (!good) {
      return cb(new Error('"files" must be a buffer, readable stream, or array of objects'))
    }

    var sendWithTransform = send.withTransform(addToDagNodesTransform)

    return sendWithTransform('add', null, opts, files, cb)
  }
}
