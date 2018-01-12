'use strict'

const promisify = require('promisify-es6')
const moduleConfig = require('./utils/module-config')

const transform = function (res, callback) {
  callback(null, res.Path)
}

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'dns',
      args: args,
      qs: opts
    }, transform, callback)
  })
}
