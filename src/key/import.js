'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((name, pem, password, callback) => {
    send({
      path: 'key/import',
      args: name,
      qs: {
        pem: pem,
        password: password
      }
    }, callback)
  })
}
