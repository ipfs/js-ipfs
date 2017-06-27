'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((callback) => {
    send({
      path: 'log/ls'
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      callback(null, result.Strings)
    })
  })
}
