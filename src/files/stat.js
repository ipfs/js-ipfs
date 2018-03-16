'use strict'

const promisify = require('promisify-es6')
const _ = require('lodash')

const transform = function (data, callback) {
  callback(null, {
    type: data.Type,
    blocks: data.Blocks,
    size: data.Size,
    hash: data.Hash,
    cumulativeSize: data.CumulativeSize,
    withLocality: data.WithLocality || false,
    local: data.Local || undefined,
    sizeLocal: data.SizeLocal || undefined
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
