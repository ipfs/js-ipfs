'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((name, password, callback) => {
    send({
      path: 'key/export',
      args: name,
      qs: { password: password }
    }, (err, pem) => {
      if (err) return callback(err)
      callback(null, pem.toString())
    })
  })
}
