'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, {
    id: res.Id,
    name: res.Name
  })
}

module.exports = (send) => {
  return promisify((name, pem, password, callback) => {
    send.andTransform({
      path: 'key/import',
      args: name,
      qs: {
        pem: pem,
        password: password
      }
    }, transform, callback)
  })
}
