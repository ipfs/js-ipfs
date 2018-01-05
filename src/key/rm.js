'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, {
    id: res.Keys[0].Id,
    name: res.Keys[0].Name
  })
}

module.exports = (send) => {
  return promisify((args, callback) => {
    send.andTransform({
      path: 'key/rm',
      args: args
    }, transform, callback)
  })
}
