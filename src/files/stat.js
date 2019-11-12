'use strict'

const promisify = require('promisify-es6')
const mapKeys = require('just-map-keys')
const kebabCase = require('just-kebab-case')

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

    opts = mapKeys(opts, (v, k) => kebabCase(k))

    send.andTransform({
      path: 'files/stat',
      args: args,
      qs: opts
    }, transform, callback)
  })
}
