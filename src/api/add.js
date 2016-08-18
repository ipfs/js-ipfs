'use strict'

const isStream = require('isstream')
const addToDagNodesTransform = require('../add-to-dagnode-transform')
const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((files, callback) => {
    const good = Buffer.isBuffer(files) ||
               isStream.isReadable(files) ||
               Array.isArray(files)

    if (!good) {
      callback(new Error('"files" must be a buffer, readable stream, or array of objects'))
    }

    const sendWithTransform = send.withTransform(addToDagNodesTransform)

    return sendWithTransform({
      path: 'add',
      files: files
    }, callback)
  })
}
