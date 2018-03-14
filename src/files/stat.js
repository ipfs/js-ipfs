'use strict'

const promisify = require('promisify-es6')
const _ = require('lodash')
const streamToValue = require('../utils/stream-to-value')

const transform = function (res, callback) {
  return streamToValue(res, (err, data) => {
    if (err) {
      return callback(err)
    }

    callback(null, {
      type: data[0].Type,
      blocks: data[0].Blocks,
      size: data[0].Size,
      hash: data[0].Hash,
      cumulativeSize: data[0].CumulativeSize,
      withLocality: data[0].WithLocality || false,
      local: data[0].Local || null,
      sizeLocal: data[0].SizeLocal || null
    })
  })
}

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    opts = _.mapKeys(opts, (v, k) => _.kebabCase(k))

    send.andTransform({
      path: 'files/stat',
      args: args,
      qs: opts
    }, transform, callback)
  })
}
