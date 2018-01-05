'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, {
    id: res.Id,
    was: res.Was,
    now: res.Now,
    overwrite: res.Overwrite
  })
}

module.exports = (send) => {
  return promisify((oldName, newName, callback) => {
    send.andTransform({
      path: 'key/rename',
      args: [oldName, newName]
    }, transform, callback)
  })
}
