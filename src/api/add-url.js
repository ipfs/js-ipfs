'use strict'

const Wreck = require('wreck')
const addToDagNodesTransform = require('../add-to-dagnode-transform')

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((url, opts, callback) => {
    if (typeof (opts) === 'function' &&
        callback === undefined) {
      callback = opts
      opts = {}
    }

    if (typeof url !== 'string' ||
        !url.startsWith('http')) {
      return callback(new Error('"url" param must be an http(s) url'))
    }

    const sendWithTransform = send.withTransform(addToDagNodesTransform)

    Wreck.request('GET', url, null, (err, res) => {
      if (err) {
        return callback(err)
      }

      sendWithTransform({
        path: 'add',
        qs: opts,
        files: res
      }, callback)
    })
  })
}
