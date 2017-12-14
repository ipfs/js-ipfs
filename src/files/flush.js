'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((args, callback) => {
    return send({
      path: 'files/flush',
      args: args
    }, callback)
  })
}
