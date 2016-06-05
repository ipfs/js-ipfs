'use strict'

const Wreck = require('wreck')
const addToDagNodesTransform = require('../add-to-dagnode-transform')

module.exports = (send) => {
  return function add (url, opts, cb) {
    if (typeof (opts) === 'function' && cb === undefined) {
      cb = opts
      opts = {}
    }

    if (typeof url !== 'string' || !url.startsWith('http')) {
      return cb(new Error('"url" param must be an http(s) url'))
    }

    var sendWithTransform = send.withTransform(addToDagNodesTransform)

    Wreck.request('GET', url, null, (err, res) => {
      if (err) return cb(err)

      sendWithTransform('add', null, opts, res, cb)
    })
  }
}
