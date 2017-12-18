'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((args, callback) => {
    send({
      path: 'key/rm',
      args: args
    }, callback)
  })
}
